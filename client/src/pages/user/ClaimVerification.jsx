// File: ClaimVerification.jsx
// Description: Module: Handles ClaimVerification logical operations.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI, claimAPI } from '../../services/api';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    Shield,
    ChevronLeft,
    AlertCircle,
    Loader2,
    FileText,
    Camera,
    CheckCircle2,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

// React Component: Renders the ClaimVerification user interface elements dynamically
export default function ClaimVerification() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idFile, setIdFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [description, setDescription] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [evidencePreviews, setEvidencePreviews] = useState([]);

    const idTypes = [
        { value: 'passport', label: 'Passport' },
        { value: 'citizenship', label: 'Citizenship Certificate' },
        { value: 'nationalId', label: 'National ID Card' },
        { value: 'drivingLicense', label: 'Driving License' }
    ];

    // Side Effect: This code block executes automatically when this page mounts on the user screen
useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await postAPI.getOne(id);
                setPost(response.data);
            } catch (error) {
                toast.error("Failed to load post details");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setIdFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEvidenceChange = (e) => {
        const files = Array.from(e.target.files);
        if (evidenceFiles.length + files.length > 5) {
            return toast.error('Maximum 5 evidence files allowed');
        }

        const validFiles = [];
        const newPreviews = [];

        files.forEach(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            const limit = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

            if (!isImage && !isVideo) {
                toast.error(`${file.name} is not an image or video`);
                return;
            }

            if (file.size > limit) {
                toast.error(`${file.name} exceeds size limit`);
                return;
            }

            validFiles.push(file);
            newPreviews.push({
                url: URL.createObjectURL(file),
                type: isVideo ? 'video' : 'image'
            });
        });

        setEvidenceFiles(prev => [...prev, ...validFiles]);
        setEvidencePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeEvidence = (index) => {
        setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
        setEvidencePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idFile || !idType || !idNumber) {
            return toast.error("Please complete all verification fields");
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('postId', id);
            formData.append('itemTitle', post?.title);
            formData.append('idType', idType);
            formData.append('idNumber', idNumber);
            formData.append('message', description);
            formData.append('idFront', idFile); // Backend expects 'idFront'

            evidenceFiles.forEach(file => {
                formData.append('evidence', file);
            });

            await claimAPI.create(formData);

            toast.success("Verification submitted for review");
            navigate(`/post/${id}`);
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error("Failed to submit verification");
            setIsSubmitting(false); // Only reset on error
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-500 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-textSecondary dark:text-gray-400 hover:text-primary transition-all font-bold group mb-10"
                >
                    <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:-translate-x-1">
                        <ChevronLeft className="h-5 w-5" />
                    </div>
                    <span className="uppercase tracking-widest text-xs">Cancel Claim</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Post Context */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800">
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Item Details</h3>
                            {post.imageUrl && (
                                <img src={post.imageUrl} className="w-full h-40 object-cover rounded-2xl mb-4 shadow-lg" alt="Post" />
                            )}
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2">{post.title}</h4>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2">{post.type} • {post.category}</p>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-[2rem] border border-primary/10">
                            <h4 className="font-black text-primary text-[10px] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Legal Notice
                            </h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                Submission of false identification is a punishable offense. Your IP and account details are logged for safety.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Verification Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Claim Verification</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Verify your identity to proceed with the claim</p>
                            </div>

                            {!userData?.isVerified && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight">Identity Status: Unverified</p>
                                        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">This document will be used to verify your account permanently.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">ID Type</label>
                                    <select
                                        value={idType}
                                        onChange={(e) => setIdType(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all text-sm appearance-none"
                                        required
                                    >
                                        <option value="">Select ID Type...</option>
                                        {idTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">ID Number</label>
                                    <input
                                        type="text"
                                        value={idNumber}
                                        onChange={(e) => setIdNumber(e.target.value)}
                                        placeholder="Enter ID Number"
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Upload ID Photo</label>
                                <div
                                    className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all text-center group ${previewUrl
                                        ? 'border-primary/50 bg-primary/5 shadow-inner'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary bg-gray-50 dark:bg-gray-950/50 dark:hover:bg-gray-900/50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        id="id-upload"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        required
                                    />
                                    <label htmlFor="id-upload" className="cursor-pointer">
                                        {previewUrl ? (
                                            <div className="space-y-4">
                                                <img src={previewUrl} className="h-48 w-full object-cover rounded-xl shadow-2xl mx-auto" alt="Preview" />
                                                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Document Loaded - Click to Replace
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg inline-block mb-4 text-gray-400 group-hover:text-primary transition-colors">
                                                    <Camera className="h-8 w-8" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.2em] text-xs text-gray-900 dark:text-white mb-1">Upload ID Photo</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Government ID (Front Side)</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Ownership Evidence (Description)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide specific details that only the owner would know (e.g., contents of a bag, specific marks, internal identification)..."
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all text-sm h-32 resize-none"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Evidence Photos (Max 5)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {evidencePreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-800 shadow-sm">
                                            {preview.type === 'video' ? (
                                                <video src={preview.url} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={preview.url} className="w-full h-full object-cover" alt={`Evidence ${index + 1}`} />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeEvidence(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {evidenceFiles.length < 5 && (
                                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group bg-gray-50/50 dark:bg-gray-950/30">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={handleEvidenceChange}
                                                className="hidden"
                                            />
                                            <Camera className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                            <span className="text-[9px] font-black text-gray-400 group-hover:text-primary uppercase tracking-widest mt-2">Add Media</span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="h-5 w-5" />
                                        Submit for Review
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
