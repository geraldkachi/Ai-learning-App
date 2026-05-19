// components/documents/UploadDocumentModal.tsx
import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Upload, FileText, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../services/documentService'

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState<boolean>(false)

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await documentService.uploadDocument(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded successfully!')
      resetForm()
      onClose()
    },
    onError: (error: any) => {
      console.error('Upload error:', error)
      toast.error(error.error || 'Failed to upload document')
    }
  })

  const resetForm = (): void => {
    setTitle('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (file: File): void => {
    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'pdf') {
      toast.error('Only PDF files are allowed')
      return
    }
    
    setSelectedFile(file)
    // Auto-populate title from filename if not set
    if (!title) {
      const fileNameWithoutExt = file.name.replace(/\.pdf$/i, '')
      setTitle(fileNameWithoutExt)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a document title')
      return
    }
    
    if (!selectedFile) {
      toast.error('Please select a PDF file')
      return
    }
    
    const formData = new FormData()
    formData.append('title', title)
    formData.append('file', selectedFile)
    
    console.log('Uploading:', {
      title,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type
    })
    
    uploadMutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upload New Document</h2>
              <p className="text-sm text-gray-500 mt-1">Add a PDF document to your library</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Document Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOCUMENT TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., React Interview Prep"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF FILE
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your PDF file here
                    </p>
                    <p className="text-sm text-gray-400">
                      or click to browse
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Only PDF files are supported (Max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMutation.isPending || !selectedFile || !title}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadDocumentModal