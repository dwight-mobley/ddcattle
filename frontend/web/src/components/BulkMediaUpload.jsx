import React, { useState, useRef } from 'react';
// Adjust these import paths to match your project structure
import { useGetAnimalsQuery } from '../features/api/animalApi';
import { useUploadMediaMutation } from '../features/media/mediaApiSlice';

export default function BulkMediaUpload() {
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    
    // RTK Query Hooks
    const { data: animals = [], isLoading: isLoadingAnimals } = useGetAnimalsQuery();
    const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

    // Form State for Django Model Metadata
    const [meta, setMeta] = useState({
        animal: '',
        media_type: 'image',
        caption: '',
        description: '',
        public: false,
        sort_order: 0,
    });

    const handleMetaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMeta(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
        // Cleanup progress state for removed file
        setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[indexToRemove];
            return newProgress;
        });
    };

    const handleBulkUpload = async () => {
        if (!selectedFiles.length || !meta.animal) return;

        const uploadPromises = selectedFiles.map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('animal', meta.animal);
            
            // If the user selects "Auto", we can infer from the file mime type. 
            // Otherwise, we strictly use the dropdown value.
            let resolvedMediaType = meta.media_type;
            if (resolvedMediaType === 'auto') {
                if (file.type.startsWith('video/')) resolvedMediaType = 'video';
                else if (file.type.startsWith('image/')) resolvedMediaType = 'image';
                else resolvedMediaType = 'document';
            }
            
            formData.append('media_type', resolvedMediaType);
            formData.append('public', meta.public);
            formData.append('sort_order', meta.sort_order);
            
            // Only append optional strings if they exist to prevent sending "undefined" or empty strings
            if (meta.caption) formData.append('caption', meta.caption);
            if (meta.description) formData.append('description', meta.description);

            try {
                setUploadProgress(prev => ({ ...prev, [index]: 'loading' }));
                
                await uploadMedia(formData).unwrap();
                
                setUploadProgress(prev => ({ ...prev, [index]: 'success' }));
            } catch (error) {
                console.error(`Upload failed for ${file.name}:`, error);
                setUploadProgress(prev => ({ ...prev, [index]: 'error' }));
            }
        });

        await Promise.allSettled(uploadPromises);
    };

    const isSubmitDisabled = isUploading || selectedFiles.length === 0 || !meta.animal;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-saddle-brown/10 overflow-hidden">
            <div className="border-b border-saddle-brown/10 bg-desert-sand/30 px-6 py-4">
                <h2 className="text-lg font-bold text-saddle-brown">Batch Upload Media</h2>
                <p className="text-sm text-charcoal/70">Upload multiple files and apply identical metadata to all.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {/* Left Column: Metadata Form */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="animal">
                            Select Animal <span className="text-rust">*</span>
                        </label>
                        <select
                            name="animal"
                            id="animal"
                            value={meta.animal}
                            onChange={handleMetaChange}
                            className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:ring-2 focus:ring-saddle-brown focus:border-transparent bg-white"
                            required
                        >
                            <option value="">{isLoadingAnimals ? 'Loading animals...' : '-- Select an Animal --'}</option>
                            {animals.map(animal => (
                                <option key={animal.id} value={animal.id}>
                                    {animal.name} {/* Adjust depending on your Animal model fields */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="media_type">
                                Media Type
                            </label>
                            <select
                                name="media_type"
                                id="media_type"
                                value={meta.media_type}
                                onChange={handleMetaChange}
                                className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:ring-2 focus:ring-saddle-brown focus:border-transparent bg-white"
                            >
                                <option value="auto">Auto-detect</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="sort_order">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                name="sort_order"
                                id="sort_order"
                                min="0"
                                value={meta.sort_order}
                                onChange={handleMetaChange}
                                className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:ring-2 focus:ring-saddle-brown focus:border-transparent bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="caption">
                            Caption
                        </label>
                        <input
                            type="text"
                            name="caption"
                            id="caption"
                            maxLength="250"
                            value={meta.caption}
                            onChange={handleMetaChange}
                            className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:ring-2 focus:ring-saddle-brown focus:border-transparent bg-white"
                            placeholder="Optional short caption..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-1" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            rows="3"
                            value={meta.description}
                            onChange={handleMetaChange}
                            className="w-full px-4 py-2 border border-sage/50 rounded-lg focus:ring-2 focus:ring-saddle-brown focus:border-transparent bg-white resize-none"
                            placeholder="Optional detailed description..."
                        ></textarea>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            name="public"
                            id="public"
                            checked={meta.public}
                            onChange={handleMetaChange}
                            className="h-4 w-4 text-saddle-brown focus:ring-saddle-brown border-sage/50 rounded"
                        />
                        <label htmlFor="public" className="text-sm font-medium text-charcoal">
                            Make media public
                        </label>
                    </div>
                </div>

                {/* Right Column: File Dropzone & Queue */}
                <div className="flex flex-col h-full">
                    <div 
                        className="border-2 border-dashed border-sage/50 rounded-lg p-8 text-center hover:bg-sage/5 transition-colors cursor-pointer mb-4"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            multiple 
                            accept=".jpg, .jpeg, .png, .gif, .mp4, .mov, .avi, .pdf, .doc, .docx, .txt"
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <div className="mx-auto flex justify-center mb-3 text-sage">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <p className="text-charcoal font-medium">Click or drag files here</p>
                    </div>

                    {/* File Queue */}
                    <div className="flex-1 overflow-y-auto min-h-[150px] max-h-[300px] pr-2 custom-scrollbar">
                        {selectedFiles.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-charcoal/50 italic border border-transparent">
                                No files selected
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between p-3 bg-desert-sand/20 rounded-lg border border-saddle-brown/5">
                                        <div className="flex flex-col overflow-hidden pr-3">
                                            <span className="text-sm text-charcoal truncate font-medium">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-charcoal/60">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {uploadProgress[index] === 'loading' && <span className="text-xs text-sage font-medium">Uploading...</span>}
                                            {uploadProgress[index] === 'success' && <span className="text-xs text-green-600 font-medium">Done ✓</span>}
                                            {uploadProgress[index] === 'error' && <span className="text-xs text-rust font-medium">Failed</span>}
                                            
                                            {!isUploading && uploadProgress[index] !== 'success' && (
                                                <button 
                                                    onClick={() => removeFile(index)}
                                                    className="text-rust hover:text-rust/70 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button 
                        onClick={handleBulkUpload}
                        disabled={isSubmitDisabled}
                        className="mt-6 w-full bg-saddle-brown text-desert-sand font-medium py-3 rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
}