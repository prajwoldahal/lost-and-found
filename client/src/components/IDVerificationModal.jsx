import { useState } from 'react';
import { X, Upload, Shield, CheckCircle, AlertTriangle, Loader2, PlusCircle } from 'lucide-react';
import { claimAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function IDVerificationModal({ isOpen, onClose, onConfirm, item, isAccountVerification = false }) {
    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idFile, setIdFile] = useState(null);
    const [idFileBack, setIdFileBack] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewUrlBack, setPreviewUrlBack] = useState(null);
    const [evidenceFiles, setEvidenceFiles] = useState([]);
    const [evidencePreviews, setEvidencePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !item) return null;

    const idTypes = [
        { value: 'passport', label: 'Passport' },
        { value: 'citizenship', label: 'Citizenship Certificate' },
        { value: 'nationalId', label: 'National ID Card' },
        { value: 'drivingLicense', label: 'Driving License' }
    ];

    const handleFileChange = (e, side = 'front') => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPG, PNG, or WebP)');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            if (side === 'back') {
                setIdFileBack(file);
                setPreviewUrlBack(URL.createObjectURL(file));
            } else {
                setIdFile(file);
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    const handleEvidenceChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error(`"${file.name}" is not a valid image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length + evidenceFiles.length > 5) {
            toast.error('You can upload a maximum of 5 evidence images');
            return;
        }

        const newFiles = [...evidenceFiles, ...validFiles];
        const newPreviews = [...evidencePreviews, ...validFiles.map(f => URL.createObjectURL(f))];

        setEvidenceFiles(newFiles);
        setEvidencePreviews(newPreviews);
    };

    const removeEvidence = (index) => {
        const newFiles = [...evidenceFiles];
        const newPreviews = [...evidencePreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setEvidenceFiles(newFiles);
        setEvidencePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idFile) return;

        // Validation for citizenship
        if (idType === 'citizenship' && !idFileBack) {
            return toast.error("Please upload both front and back sides of your citizenship certificate");
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('idType', idType);
            formData.append('idNumber', idNumber);
            formData.append('idFront', idFile);

            if (idType === 'citizenship' && idFileBack) {
                formData.append('idBack', idFileBack);
            }

            // Append multiple evidence files
            evidenceFiles.forEach(file => {
                formData.append('evidence', file);
            });

            if (isAccountVerification) {
                formData.append('verificationPending', 'true');
                // Handle account verification
                await userAPI.update('me', formData);
                toast.success('Account verification submitted!');
            } else {
                formData.append('postId', item.id);
                formData.append('itemTitle', item.title);
                formData.append('message', `Claim for ${item.title}`);
                // Handle item claim
                await claimAPI.create(formData);
                toast.success('Claim submitted successfully!');
            }

            if (onConfirm) onConfirm();
            handleClose();
        } catch (error) {
            console.error('Verification Error:', error);
            const message = error.response?.data?.error || error.message || 'Failed to submit verification';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIdType('');
        setIdNumber('');
        setIdFile(null);
        setIdFileBack(null);
        setPreviewUrl(null);
        setPreviewUrlBack(null);
        setEvidenceFiles([]);
        setEvidencePreviews([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-start bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
                            <p className="text-sm text-gray-600">Step 2 of 2</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Why we need this</p>
                            <p>To prevent fraud and ensure safe transactions, we require government-issued ID verification for all claims.</p>
                        </div>
                    </div>

                    {/* Item Being Claimed */}
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-xs text-gray-600 mb-1">Claiming Item:</p>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.category} • {item.locationName}</p>
                    </div>

                    {/* ID Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Document Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">Select ID type...</option>
                            {idTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* ID Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="Enter your ID number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            minLength={5}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the number exactly as shown on your ID document
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {idType === 'citizenship' ? 'Front Side ID Photo' : 'Upload ID Photo'} <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
                                <input
                                    type="file"
                                    id="id-upload-front"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'front')}
                                    className="hidden"
                                    required
                                />
                                <label
                                    htmlFor="id-upload-front"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="h-8 w-8 text-gray-400 mb-3" />
                                    {previewUrl ? (
                                        <div className="text-sm">
                                            <img src={previewUrl} className="h-32 w-auto object-cover rounded-lg mb-2 mx-auto" alt="Preview Front" />
                                            <p className="font-medium text-green-600 flex items-center justify-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Ready
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <p className="text-gray-700 font-medium mb-1">Click to upload front</p>
                                            <p className="text-xs text-gray-500">JPG, PNG or WebP</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {idType === 'citizenship' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Back Side ID Photo <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
                                    <input
                                        type="file"
                                        id="id-upload-back"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'back')}
                                        className="hidden"
                                        required={idType === 'citizenship'}
                                    />
                                    <label
                                        htmlFor="id-upload-back"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="h-8 w-8 text-gray-400 mb-3" />
                                        {previewUrlBack ? (
                                            <div className="text-sm">
                                                <img src={previewUrlBack} className="h-32 w-auto object-cover rounded-lg mb-2 mx-auto" alt="Preview Back" />
                                                <p className="font-medium text-green-600 flex items-center justify-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Ready
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                <p className="text-gray-700 font-medium mb-1">Click to upload back</p>
                                                <p className="text-xs text-gray-500">JPG, PNG or WebP</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Supporting Evidence (Only for Item Claims) */}
                        {!isAccountVerification && (
                            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supporting Evidence (Optional)
                                    <span className="text-xs font-normal text-gray-500 ml-2">Upload up to 5 photos showing ownership</span>
                                </label>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {evidencePreviews.map((url, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                            <img src={url} className="w-full h-full object-cover" alt={`Evidence ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeEvidence(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {evidenceFiles.length < 5 && (
                                        <label className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition bg-gray-50/50">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleEvidenceChange}
                                            />
                                            <PlusCircle className="h-6 w-6 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase">Add Proof</span>
                                        </label>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 leading-tight">
                                    Include photos of serial numbers, unique marks, or other proof that this item belongs to you.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-800">
                            <p className="font-semibold mb-1">Privacy & Security</p>
                            <p>Your ID information is encrypted and stored securely. It will only be used for verification purposes and will not be shared with third parties.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!idType || !idNumber || !idFile || isSubmitting}
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4" />
                                    Submit & Claim
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
