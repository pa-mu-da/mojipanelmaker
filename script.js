/**
 * Text Panel Maker - Main Script
 */

class App {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.settings = {
            width: 800,
            height: 600,
            bgType: 'transparent',
            bgImage: null,
            bgCornerRadius: 0,
            bgPadding: 0,
            borderImageEnabled: false,
            borderImage: null,
            borderImageBlendMode: 'normal',
            borderImageOpacity: 100,
            fontFamily: "Noto Sans JP",
            fontWeight: '700',
            fontSize: 45,
            textColor: '#000000',
            textAlign: 'center',
            outlineEnabled: true,
            outlineColor: '#ffffff',
            outlineWidth: 5,
            doubleOutlineEnabled: false,
            doubleOutlineMode: 'normal',
            doubleOutlineColor: '#000000',
            doubleOutlineWidth: 3
        };

        this.initElements();
        this.initEventListeners();
        this.updateDoubleOutlineVisibility();
    }

    initElements() {
        this.inputs = {
            width: document.getElementById('canvasWidth'),
            height: document.getElementById('canvasHeight'),
            ratioWidth: document.getElementById('ratioWidth'),
            ratioHeight: document.getElementById('ratioHeight'),
            applyRatio: document.getElementById('applyRatioBtn'),
            bgType: document.getElementsByName('bgType'),
            bgColor: document.getElementById('bgColor'),
            bgBorderEnabled: document.getElementById('bgBorderEnabled'),
            bgBorderColor: document.getElementById('bgBorderColor'),
            bgBorderWidth: document.getElementById('bgBorderWidth'),
            bgCornerRadius: document.getElementById('bgCornerRadius'),
            bgPadding: document.getElementById('bgPadding'),
            bgImageInput: document.getElementById('bgImageInput'),
            borderImageEnabled: document.getElementById('borderImageEnabled'),
            borderImageInput: document.getElementById('borderImageInput'),
            borderImageBlendMode: document.getElementById('borderImageBlendMode'),
            borderImageOpacitySlider: document.getElementById('borderImageOpacitySlider'),
            borderImageOpacityValue: document.getElementById('borderImageOpacityValue'),
            borderImageSection: document.getElementById('borderImageSection'),
            borderImageSettings: document.getElementById('borderImageSettings'),
            borderImageBlend: document.getElementById('borderImageBlend'),
            borderImageOpacity: document.getElementById('borderImageOpacity'),
            fontSelect: document.getElementById('fontSelect'),
            fontWeight: document.getElementById('fontWeight'),
            fontFileInput: document.getElementById('fontFileInput'),
            fontSize: document.getElementById('fontSize'),
            textColor: document.getElementById('textColor'),
            textAlign: document.getElementById('textAlign'),
            outlineEnabled: document.getElementById('textOutlineEnabled'),
            outlineColor: document.getElementById('textOutlineColor'),
            outlineWidth: document.getElementById('textOutlineWidth'),
            doubleOutlineEnabled: document.getElementById('doubleOutlineEnabled'),
            doubleOutlineMode: document.getElementsByName('doubleOutlineMode'),
            doubleOutlineColor: document.getElementById('doubleOutlineColor'),
            doubleOutlineWidth: document.getElementById('doubleOutlineWidth'),
            text: document.getElementById('textInput'),
            generate: document.getElementById('generateBtn'),
            downloadZip: document.getElementById('downloadZipBtn'),
            previewContainer: document.getElementById('previewContainer'),
            bgSettingColor: document.getElementById('bgSettingColor'),
            bgSettingImage: document.getElementById('bgSettingImage'),
            bgSettingColorImage: document.getElementById('bgSettingColorImage'),
            doubleOutlineSection: document.getElementById('doubleOutlineSection'),
            doubleOutlineSettings: document.getElementById('doubleOutlineSettings'),
            doubleOutlineColorWidth: document.getElementById('doubleOutlineColorWidth')
        };
    }

    initEventListeners() {
        this.inputs.bgType.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.settings.bgType = e.target.value;
                this.updateBgSettingsVisibility();
            });
        });

        this.inputs.generate.addEventListener('click', () => {
            this.updateSettingsFromInputs();
            this.generateImages();
        });

        this.inputs.applyRatio.addEventListener('click', () => {
            const w = parseInt(this.inputs.ratioWidth.value);
            const h = parseInt(this.inputs.ratioHeight.value);
            if (w && h) {
                const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                const divisor = gcd(w, h);
                this.inputs.width.value = (w / divisor) * 100;
                this.inputs.height.value = (h / divisor) * 100;
            }
        });

        this.inputs.downloadZip.addEventListener('click', () => {
            this.downloadZip();
        });

        this.inputs.bgImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => { this.settings.bgImage = img; };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        this.inputs.fontFileInput.addEventListener('change', (e) => {
            this.handleFontUpload(e.target.files[0]);
        });

        this.inputs.fontSelect.addEventListener('change', (e) => {
            this.loadGoogleFont(e.target.value);
        });

        // Double outline visibility control
        this.inputs.outlineEnabled.addEventListener('change', () => {
            this.updateDoubleOutlineVisibility();
        });

        this.inputs.outlineWidth.addEventListener('input', () => {
            this.updateDoubleOutlineVisibility();
        });

        this.inputs.doubleOutlineEnabled.addEventListener('change', () => {
            this.updateDoubleOutlineVisibility();
        });

        // Border image overlay controls
        this.inputs.bgBorderEnabled.addEventListener('change', () => {
            this.updateBorderImageVisibility();
        });

        this.inputs.borderImageEnabled.addEventListener('change', () => {
            this.updateBorderImageVisibility();
        });

        this.inputs.borderImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => { this.settings.borderImage = img; };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        this.inputs.borderImageOpacitySlider.addEventListener('input', (e) => {
            this.inputs.borderImageOpacityValue.textContent = e.target.value;
        });
    }

    updateDoubleOutlineVisibility() {
        const outlineEnabled = this.inputs.outlineEnabled.checked;
        const outlineWidth = parseInt(this.inputs.outlineWidth.value) || 0;
        const doubleEnabled = this.inputs.doubleOutlineEnabled.checked;

        // Show double outline section only if outline is enabled and width >= 1
        if (outlineEnabled && outlineWidth >= 1) {
            this.inputs.doubleOutlineSection.style.display = '';
        } else {
            this.inputs.doubleOutlineSection.style.display = 'none';
            this.inputs.doubleOutlineSettings.style.display = 'none';
            this.inputs.doubleOutlineColorWidth.style.display = 'none';
            return;
        }

        // Show settings only if double outline is enabled
        if (doubleEnabled) {
            this.inputs.doubleOutlineSettings.style.display = '';
            this.inputs.doubleOutlineColorWidth.style.display = '';
        } else {
            this.inputs.doubleOutlineSettings.style.display = 'none';
            this.inputs.doubleOutlineColorWidth.style.display = 'none';
        }
    }

    loadGoogleFont(fontFamily) {
        this.settings.fontFamily = fontFamily;
    }

    updateBgSettingsVisibility() {
        const type = this.settings.bgType;
        this.inputs.bgSettingColor.classList.toggle('hidden', type !== 'color');
        this.inputs.bgSettingImage.classList.toggle('hidden', type !== 'image');
        this.inputs.bgSettingColorImage.classList.toggle('hidden', type === 'transparent');
    }

    updateBorderImageVisibility() {
        const borderEnabled = this.inputs.bgBorderEnabled.checked;
        const borderImageEnabled = this.inputs.borderImageEnabled.checked;

        // Show border image section only if border is enabled
        if (borderEnabled) {
            this.inputs.borderImageSection.style.display = '';
        } else {
            this.inputs.borderImageSection.style.display = 'none';
            this.inputs.borderImageSettings.style.display = 'none';
            this.inputs.borderImageBlend.style.display = 'none';
            this.inputs.borderImageOpacity.style.display = 'none';
            return;
        }

        // Show settings only if border image is enabled
        if (borderImageEnabled) {
            this.inputs.borderImageSettings.style.display = '';
            this.inputs.borderImageBlend.style.display = '';
            this.inputs.borderImageOpacity.style.display = '';
        } else {
            this.inputs.borderImageSettings.style.display = 'none';
            this.inputs.borderImageBlend.style.display = 'none';
            this.inputs.borderImageOpacity.style.display = 'none';
        }
    }

    updateSettingsFromInputs() {
        this.settings.width = parseInt(this.inputs.width.value);
        this.settings.height = parseInt(this.inputs.height.value);
        this.settings.bgColor = this.inputs.bgColor.value;
        this.settings.bgBorderEnabled = this.inputs.bgBorderEnabled.checked;
        this.settings.bgBorderColor = this.inputs.bgBorderColor.value;
        this.settings.bgBorderWidth = parseInt(this.inputs.bgBorderWidth.value);
        this.settings.bgCornerRadius = parseInt(this.inputs.bgCornerRadius.value) || 0;
        this.settings.bgPadding = parseInt(this.inputs.bgPadding.value) || 0;
        this.settings.borderImageEnabled = this.inputs.borderImageEnabled.checked;
        this.settings.borderImageBlendMode = this.inputs.borderImageBlendMode.value;
        this.settings.borderImageOpacity = parseInt(this.inputs.borderImageOpacitySlider.value);
        this.settings.fontFamily = this.inputs.fontSelect.value;
        this.settings.fontWeight = this.inputs.fontWeight.value;
        this.settings.fontSize = parseInt(this.inputs.fontSize.value) || 45;
        this.settings.textColor = this.inputs.textColor.value;
        this.settings.textAlign = this.inputs.textAlign.value;
        this.settings.outlineEnabled = this.inputs.outlineEnabled.checked;
        this.settings.outlineColor = this.inputs.outlineColor.value;
        this.settings.outlineWidth = parseInt(this.inputs.outlineWidth.value);
        this.settings.doubleOutlineEnabled = this.inputs.doubleOutlineEnabled.checked;

        // Get selected radio button value
        for (const radio of this.inputs.doubleOutlineMode) {
            if (radio.checked) {
                this.settings.doubleOutlineMode = radio.value;
                break;
            }
        }

        this.settings.doubleOutlineColor = this.inputs.doubleOutlineColor.value;
        this.settings.doubleOutlineWidth = parseInt(this.inputs.doubleOutlineWidth.value);
    }

    async handleFontUpload(file) {
        if (!file) return;
        const fontName = "UserFont_" + Date.now();
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const fontFace = new FontFace(fontName, e.target.result);
                await fontFace.load();
                document.fonts.add(fontFace);
                const option = document.createElement('option');
                option.value = fontName;
                option.textContent = file.name;
                this.inputs.fontSelect.add(option);
                this.inputs.fontSelect.value = fontName;
                alert('フォントを読み込みました: ' + file.name);
            } catch (err) {
                console.error(err);
                alert('フォントの読み込みに失敗しました');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    async generateImages() {
        const text = this.inputs.text.value;
        if (!text.trim()) {
            alert('テキストを入力してください');
            return;
        }

        try {
            await document.fonts.load(`${this.settings.fontWeight} ${this.settings.fontSize}px "${this.settings.fontFamily}"`);
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
            console.warn('Font loading warning:', e);
        }

        const blocks = text.split(/\n\s*\n/).filter(b => b.trim() !== '');
        this.inputs.previewContainer.innerHTML = '';
        this.generatedImages = [];

        blocks.forEach((block, index) => {
            this.createImage(block, index + 1);
        });
    }

    createImage(textBlock, index) {
        this.canvas.width = this.settings.width;
        this.canvas.height = this.settings.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate effective dimensions with padding
        const padding = this.settings.bgPadding;

        // Set clipping to canvas bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.clip();

        // Apply padding offset
        if (padding > 0) {
            ctx.translate(padding, padding);

            // Create a temporary canvas for the padded content
            const tempCanvas = document.createElement('canvas');
            const effectiveWidth = this.canvas.width - (padding * 2);
            const effectiveHeight = this.canvas.height - (padding * 2);
            tempCanvas.width = effectiveWidth;
            tempCanvas.height = effectiveHeight;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw on temporary canvas
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            this.canvas = tempCanvas;
            this.ctx = tempCtx;

            this.drawBackground(tempCtx);
            this.drawText(tempCtx, textBlock);

            // Restore original canvas and context
            this.canvas = originalCanvas;
            this.ctx = originalCtx;

            // Draw the temporary canvas onto the main canvas
            ctx.drawImage(tempCanvas, 0, 0);
        } else {
            // No padding, draw directly
            this.drawBackground(ctx);
            this.drawText(ctx, textBlock);
        }

        ctx.restore();

        const dataUrl = this.canvas.toDataURL('image/png');
        this.generatedImages.push({ id: index, text: textBlock, data: dataUrl });
        this.addPreviewItem(dataUrl, textBlock, index);
    }

    drawBackground(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const radius = this.settings.bgCornerRadius;

        if (this.settings.bgType === 'color') {
            ctx.fillStyle = this.settings.bgColor;

            if (radius > 0) {
                this.drawRoundedRect(ctx, 0, 0, w, h, radius, true, false);
            } else {
                ctx.fillRect(0, 0, w, h);
            }

            if (this.settings.bgBorderEnabled) {
                const bw = this.settings.bgBorderWidth;
                ctx.strokeStyle = this.settings.bgBorderColor;
                ctx.lineWidth = bw;

                if (radius > 0) {
                    this.drawRoundedRect(ctx, bw / 2, bw / 2, w - bw, h - bw, Math.max(0, radius - bw / 2), false, true);
                } else {
                    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
                }

                // Draw border image overlay
                if (this.settings.borderImageEnabled && this.settings.borderImage) {
                    this.drawBorderImageOverlay(ctx, w, h, radius, bw);
                }
            }
        } else if (this.settings.bgType === 'image' && this.settings.bgImage) {
            const img = this.settings.bgImage;

            // Create clipping path for rounded corners
            if (radius > 0) {
                ctx.save();
                ctx.beginPath();
                this.createRoundedRectPath(ctx, 0, 0, w, h, radius);
                ctx.clip();
            }

            // Draw image
            const imgRatio = img.width / img.height;
            const canvasRatio = w / h;
            let dw, dh, dx, dy;
            if (imgRatio > canvasRatio) {
                dh = h;
                dw = h * imgRatio;
                dy = 0;
                dx = (w - dw) / 2;
            } else {
                dw = w;
                dh = w / imgRatio;
                dx = 0;
                dy = (h - dh) / 2;
            }
            ctx.drawImage(img, dx, dy, dw, dh);

            if (radius > 0) {
                ctx.restore();
            }

            // Draw border
            if (this.settings.bgBorderEnabled) {
                const bw = this.settings.bgBorderWidth;
                ctx.strokeStyle = this.settings.bgBorderColor;
                ctx.lineWidth = bw;

                if (radius > 0) {
                    this.drawRoundedRect(ctx, bw / 2, bw / 2, w - bw, h - bw, Math.max(0, radius - bw / 2), false, true);
                } else {
                    ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
                }

                // Draw border image overlay
                if (this.settings.borderImageEnabled && this.settings.borderImage) {
                    this.drawBorderImageOverlay(ctx, w, h, radius, bw);
                }
            }
        }
    }

    drawBorderImageOverlay(ctx, w, h, radius, borderWidth) {
        const img = this.settings.borderImage;
        const opacity = this.settings.borderImageOpacity / 100;
        const blendMode = this.settings.borderImageBlendMode;

        // Create a temporary canvas for the border region
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');

        // First, clip to outer rounded rectangle shape
        tempCtx.save();
        tempCtx.beginPath();
        if (radius > 0) {
            this.createRoundedRectPath(tempCtx, 0, 0, w, h, radius);
        } else {
            tempCtx.rect(0, 0, w, h);
        }
        tempCtx.clip();

        // Draw the border image scaled to canvas size with opacity
        tempCtx.globalAlpha = opacity;
        tempCtx.drawImage(img, 0, 0, w, h);
        tempCtx.restore();

        // Now subtract the inner region
        const innerX = borderWidth;
        const innerY = borderWidth;
        const innerW = w - borderWidth * 2;
        const innerH = h - borderWidth * 2;
        const innerRadius = Math.max(0, radius - borderWidth);

        tempCtx.globalCompositeOperation = 'destination-out';
        tempCtx.fillStyle = '#000';
        tempCtx.beginPath();
        if (innerRadius > 0) {
            this.createRoundedRectPath(tempCtx, innerX, innerY, innerW, innerH, innerRadius);
        } else {
            tempCtx.rect(innerX, innerY, innerW, innerH);
        }
        tempCtx.fill();

        // Apply blend mode and draw to main canvas
        ctx.save();
        ctx.globalCompositeOperation = this.getCanvasBlendMode(blendMode);
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.restore();
    }

    getCanvasBlendMode(mode) {
        const blendModes = {
            'normal': 'source-over',
            'overlay': 'overlay',
            'multiply': 'multiply',
            'screen': 'screen'
        };
        return blendModes[mode] || 'source-over';
    }

    createRoundedRectPath(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
    }

    drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        this.createRoundedRectPath(ctx, x, y, width, height, radius);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    drawText(ctx, text) {
        const lines = text.split('\n');
        const padding = 10;

        let fontFamily = this.settings.fontFamily;
        let fallback = 'sans-serif';
        if (fontFamily.includes('Serif')) fallback = 'serif';
        if (fontFamily.includes('Gothic') || fontFamily.includes('One')) fallback = 'cursive';

        ctx.font = `${this.settings.fontWeight} ${this.settings.fontSize}px "${fontFamily}", ${fallback}`;
        ctx.textBaseline = 'middle';

        const lineHeight = this.settings.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let currentY = (this.canvas.height - totalHeight) / 2 + lineHeight / 2;

        lines.forEach(line => {
            let x;

            if (this.settings.textAlign === 'left') {
                ctx.textAlign = 'left';
                x = padding;
            } else if (this.settings.textAlign === 'right') {
                ctx.textAlign = 'right';
                x = this.canvas.width - padding;
            } else {
                ctx.textAlign = 'center';
                x = this.canvas.width / 2;
            }

            // Draw double outline (blur or normal)
            if (this.settings.outlineEnabled && this.settings.doubleOutlineEnabled) {
                if (this.settings.doubleOutlineMode === 'blur') {
                    // Blur mode: use shadow blur
                    ctx.save();
                    ctx.shadowColor = this.settings.doubleOutlineColor;
                    ctx.shadowBlur = this.settings.doubleOutlineWidth * 2;
                    ctx.fillStyle = this.settings.doubleOutlineColor;
                    ctx.fillText(line, x, currentY);
                    ctx.restore();
                } else {
                    // Normal mode: draw as stroke
                    ctx.strokeStyle = this.settings.doubleOutlineColor;
                    ctx.lineWidth = this.settings.outlineWidth + (this.settings.doubleOutlineWidth * 2);
                    ctx.lineJoin = 'round';
                    ctx.miterLimit = 2;
                    ctx.strokeText(line, x, currentY);
                }
            }

            // Draw outline
            if (this.settings.outlineEnabled) {
                ctx.strokeStyle = this.settings.outlineColor;
                ctx.lineWidth = this.settings.outlineWidth;
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(line, x, currentY);
            }

            // Draw text
            ctx.fillStyle = this.settings.textColor;
            ctx.fillText(line, x, currentY);

            currentY += lineHeight;
        });
    }

    addPreviewItem(dataUrl, text, index) {
        const div = document.createElement('div');
        div.className = 'preview-item';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'preview-image-wrapper';
        const img = document.createElement('img');
        img.src = dataUrl;
        imgWrapper.appendChild(img);

        const p = document.createElement('div');
        p.className = 'preview-text';
        p.textContent = text.replace(/\n/g, ' ');

        const btn = document.createElement('button');
        btn.className = 'download-btn';
        btn.textContent = 'ダウンロード';
        btn.onclick = () => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${index}_${this.sanitizeFilename(text)}.png`;
            a.click();
        };

        div.appendChild(imgWrapper);
        div.appendChild(p);
        div.appendChild(btn);
        this.inputs.previewContainer.appendChild(div);
    }

    async downloadZip() {
        if (!this.generatedImages || this.generatedImages.length === 0) {
            alert('画像がありません');
            return;
        }

        const zip = new JSZip();
        this.generatedImages.forEach(item => {
            const filename = `${item.id}_${this.sanitizeFilename(item.text)}.png`;
            const data = item.data.split(',')[1];
            zip.file(filename, data, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = "images.zip";
        a.click();
    }

    sanitizeFilename(text) {
        return text.replace(/[\\/:*?"<>|]/g, '').substring(0, 10).trim() || 'image';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new App();
});
