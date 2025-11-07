import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import PGCardsLogo from './PGCardsLogo';
import './CreateQR.css';

const CreateQR = () => {
  const [url, setUrl] = useState('');
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(900);
  const [margin, setMargin] = useState(0);
  const [dotsStyle, setDotsStyle] = useState('square');
  const [cornersSquareStyle, setCornersSquareStyle] = useState('square');
  const [cornersDotStyle, setCornersDotStyle] = useState('square');
  const [imageFile, setImageFile] = useState(null);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);
  const [imageSize, setImageSize] = useState(0.4);
  const [imageMargin, setImageMargin] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('PNG');
  
  const qrRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setUrl('');
    setWidth(900);
    setHeight(900);
    setMargin(0);
    setDotsStyle('square');
    setCornersSquareStyle('square');
    setCornersDotStyle('square');
    setImageFile(null);
    setImageUrl(null);
    setHideBackgroundDots(true);
    setImageSize(0.4);
    setImageMargin(0);
  };

  const handleDownload = () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = width;
        canvas.height = height;
        
        img.onload = () => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qrcode.${downloadFormat.toLowerCase()}`;
            a.click();
            URL.revokeObjectURL(url);
          }, `image/${downloadFormat.toLowerCase()}`);
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  const handleCopy = async () => {
    if (qrRef.current) {
      const svg = qrRef.current.querySelector('svg');
      if (svg) {
        try {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/svg+xml': blob })
          ]);
          alert('QR code copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy:', err);
          alert('Failed to copy QR code. Please try downloading instead.');
        }
      }
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="create-qr-page">
      

      <div className="create-qr-content">
        <div className="container">
          <div className="create-qr-layout">
            {/* Left Column - Form */}
            <div className="qr-form-column">
              <h1 className="qr-page-title">Create QR Code</h1>
              
              <div className="form-section">
                <h3 className="section-header">Basic Options</h3>
                <div className="form-group">
                  <label>URL:</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Width:</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 900)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Height:</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 900)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Margin:</label>
                  <input
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label>Dots Style:</label>
                  <select value={dotsStyle} onChange={(e) => setDotsStyle(e.target.value)}>
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Corners Square Style:</label>
                  <select value={cornersSquareStyle} onChange={(e) => setCornersSquareStyle(e.target.value)}>
                    <option value="square">Square</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="dot">Dot</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Corners Dot Style:</label>
                  <select value={cornersDotStyle} onChange={(e) => setCornersDotStyle(e.target.value)}>
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="dot">Dot</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-header">Image Options</h3>
                <div className="form-group">
                  <label>Image file:</label>
                  <div className="file-input-wrapper">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <button 
                      type="button"
                      className="btn-choose-file"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose file
                    </button>
                    {imageFile && <span className="file-name">{imageFile.name}</span>}
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={hideBackgroundDots}
                      onChange={(e) => setHideBackgroundDots(e.target.checked)}
                    />
                    Hide Background Dots
                  </label>
                </div>
                <div className="form-group">
                  <label>Image Size:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={imageSize}
                    onChange={(e) => setImageSize(parseFloat(e.target.value) || 0.4)}
                  />
                </div>
                <div className="form-group">
                  <label>Margin:</label>
                  <input
                    type="number"
                    value={imageMargin}
                    onChange={(e) => setImageMargin(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>

            {/* Right Column - Preview */}
            <div className="qr-preview-column">
              <div className="qr-preview-container" ref={qrRef}>
                <QRCodeSVG
                  value={url || ''}
                  size={Math.min(width, height, 500)}
                  level="H"
                  marginSize={margin}
                  imageSettings={imageUrl ? {
                    src: imageUrl,
                    height: Math.min(width, height, 500) * imageSize,
                    width: Math.min(width, height, 500) * imageSize,
                    excavate: hideBackgroundDots,
                  } : undefined}
                />
              </div>
              
              <div className="qr-actions">
                <select 
                  className="format-select"
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="PNG">PNG</option>
                  <option value="SVG">SVG</option>
                  <option value="JPG">JPG</option>
                </select>
                <button className="btn-download" onClick={handleDownload}>Download</button>
                <button className="btn-copy" onClick={handleCopy}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQR;

