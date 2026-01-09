import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({ image, onCropComplete, onCancel, aspectRatio = 1, cropShape = 'round' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Adjust Image</h3>
          <button style={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>
        
        <div style={styles.cropContainer}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
          />
        </div>

        <div style={styles.controls}>
          <label style={styles.zoomLabel}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={styles.saveBtn} onClick={createCroppedImage}>Apply</button>
        </div>
      </div>
    </div>
  );
};

// Helper function to create cropped image
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    background: '#1a1a1a',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    overflow: 'hidden',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a0a0a0',
    fontSize: '20px',
    cursor: 'pointer',
  },
  cropContainer: {
    position: 'relative',
    width: '100%',
    height: '350px',
    background: '#0a0a0a',
  },
  controls: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  zoomLabel: {
    color: '#a0a0a0',
    fontSize: '14px',
    minWidth: '50px',
  },
  slider: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    appearance: 'none',
    background: 'rgba(212, 175, 55, 0.2)',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '0 20px 20px',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#a0a0a0',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #d4af37 0%, #f0d97a 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#0a0a0a',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ImageCropper;
