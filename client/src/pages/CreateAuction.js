import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Upload, Calendar, DollarSign, Tag } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: '',
    minimumBidIncrement: '',
    endTime: '',
    images: []
  });

  const categories = [
    'Electronics',
    'Art & Collectibles',
    'Jewelry & Watches',
    'Furniture & Home',
    'Fashion & Accessories',
    'Sports & Outdoor',
    'Books & Media',
    'Automotive',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.category || 
          !formData.startingPrice || !formData.endTime) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (parseFloat(formData.startingPrice) <= 0) {
        toast.error('Starting price must be greater than 0');
        return;
      }

      if (new Date(formData.endTime) <= new Date()) {
        toast.error('End time must be in the future');
        return;
      }

      // In a real app, you'd send this data to your API
      // For now, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Auction created successfully!');
      navigate('/my-auctions');
    } catch (error) {
      toast.error('Failed to create auction');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Create New Auction</h1>
            <p className="text-gray-600">Set up your auction and start attracting bidders</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Auction Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="Enter a descriptive title for your auction"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input mt-1"
                  placeholder="Provide detailed information about the item"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input mt-1"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing & Duration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing & Duration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700">
                    Starting Price *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="startingPrice"
                      name="startingPrice"
                      required
                      min="0"
                      step="0.01"
                      value={formData.startingPrice}
                      onChange={handleChange}
                      className="input mt-1 pl-10"
                      placeholder="0.00"
                    />
                    <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label htmlFor="minimumBidIncrement" className="block text-sm font-medium text-gray-700">
                    Minimum Bid Increment
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="minimumBidIncrement"
                      name="minimumBidIncrement"
                      min="0"
                      step="0.01"
                      value={formData.minimumBidIncrement}
                      onChange={handleChange}
                      className="input mt-1 pl-10"
                      placeholder="0.00"
                    />
                    <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleChange}
                    className="input mt-1 pl-10"
                  />
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Choose when your auction will end
                </p>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Images</h3>
              
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Upload Images (Max 5)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Selected Images ({formData.images.length}/5)
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center"
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Auction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
