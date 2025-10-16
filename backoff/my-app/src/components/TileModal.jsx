// src/pages/TileModal.jsx
import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

const TileModal = ({ title, defaultValues, referenceData, onSubmit, onClose, isOpen, isEdit }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues,
    mode: 'onChange' // Validate on every change
  });

  const firstInputRef = useRef(null);

  // Log the watched values for debugging
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('Form State:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues); // Reset form with default values
      // Manually set values to trigger re-validation
      Object.keys(defaultValues).forEach((key) => setValue(key, defaultValues[key]));
      console.log('Default Values on Open:', defaultValues); // Debug default values
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }
  }, [isOpen, defaultValues, reset, setValue]);

  const handleSubmitWithConfirmation = async (data) => {
    if (isEdit && !window.confirm('Do you want to save the changes?')) {
      return; // Cancel submission if user declines
    }
    await onSubmit(data); // Proceed with submission if not edit or user confirms
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-900 p-6 rounded w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{title}</h2>
        <form onSubmit={handleSubmit(handleSubmitWithConfirmation)}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <input
                {...register('SkuName', { required: 'SKU Name is required' })}
                placeholder="SKU Name"
                className="border p-2 rounded w-full"
                ref={firstInputRef}
                value={watch('SkuName') || ''}
                onChange={(e) => setValue('SkuName', e.target.value)}
              />
              {errors.SkuName && <span className="text-red-600 text-sm mt-1">{errors.SkuName.message}</span>}
            </div>
            <div className="flex flex-col">
              <input
                {...register('SkuCode', { required: 'SKU Code is required' })}
                placeholder="SKU Code"
                className="border p-2 rounded w-full"
                value={watch('SkuCode') || ''}
                onChange={(e) => setValue('SkuCode', e.target.value)}
              />
              {errors.SkuCode && <span className="text-red-600 text-sm mt-1">{errors.SkuCode.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('CatName', { required: 'Category is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Category</option>
                {referenceData.categories.map((item) => (
                  <option key={item.cat_id} value={item.cat_name}>
                    {item.cat_name}
                  </option>
                ))}
              </select>
              {errors.CatName && <span className="text-red-600 text-sm mt-1">{errors.CatName.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('AppName', { required: 'Application is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Application</option>
                {referenceData.applications.map((item) => (
                  <option key={item.app_id} value={item.app_name}>
                    {item.app_name}
                  </option>
                ))}
              </select>
              {errors.AppName && <span className="text-red-600 text-sm mt-1">{errors.AppName.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('SpaceName', { required: 'Space is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Space</option>
                {referenceData.spaces.map((item) => (
                  <option key={item.space_id} value={item.space_name}>
                    {item.space_name}
                  </option>
                ))}
              </select>
              {errors.SpaceName && <span className="text-red-600 text-sm mt-1">{errors.SpaceName.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('SizeName', { required: 'Size is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Size</option>
                {referenceData.sizes.map((item) => (
                  <option key={item.size_id} value={item.size_name}>
                    {item.size_name}
                  </option>
                ))}
              </select>
              {errors.SizeName && <span className="text-red-600 text-sm mt-1">{errors.SizeName.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('FinishName', { required: 'Finish is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Finish</option>
                {referenceData.finishes.map((item) => (
                  <option key={item.finish_id} value={item.finish_name}>
                    {item.finish_name}
                  </option>
                ))}
              </select>
              {errors.FinishName && <span className="text-red-600 text-sm mt-1">{errors.FinishName.message}</span>}
            </div>
            <div className="flex flex-col">
              <select
                {...register('ColorName', { required: 'Color is required' })}
                className="border p-2 rounded w-full"
                defaultValue=""
              >
                <option value="" disabled>Select Color</option>
                {referenceData.colors.map((item) => (
                  <option key={item.color_id} value={item.color_name}>
                    {item.color_name}
                  </option>
                ))}
              </select>
              {errors.ColorName && <span className="text-red-600 text-sm mt-1">{errors.ColorName.message}</span>}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TileModal;
