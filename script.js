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
            fontFamily: "Noto Sans JP",
            fontWeight: '700',
            fontSize: 45,
            textColor: '#000000',
            textAlign: 'center',
            outlineEnabled: true,
            outlineColor: '#ffffff',
            outlineWidth: 5
        };

        this.initElements();
        this.initEventListeners();
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
            bgImageInput: document.getElementById('bgImageInput'),
            fontSelect: document.getElementById('fontSelect'),
            fontWeight: document.getElementById('fontWeight'),
            fontFileInput: document.getElementById('fontFileInput'),
            fontSize: document.getElementById('fontSize'),
            textColor: document.getElementById('textColor'),
            textAlign: document.getElementById('textAlign'),
            outlineEnabled: document.getElementById('textOutlineEnabled'),
            outlineColor: document.getElementById('textOutlineColor'),
            outlineWidth: document.getElementById('textOutlineWidth'),
            text: document.getElementById('textInput'),
            generate: document.getElementById('generateBtn'),
            downloadZip: document.getElementById('downloadZipBtn'),
            previewContainer: document.getElementById('previewContainer'),
            bgSettingColor: document.getElementById('bgSettingColor'),
            bgSettingImage: document.getElementById('bgSettingImage')
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
    }

    loadGoogleFont(fontFamily) {
        this.settings.fontFamily = fontFamily;
    }

    updateBgSettingsVisibility() {
        const type = this.settings.bgType;
        this.inputs.bgSettingColor.classList.toggle('hidden', type !== 'color');
        this.inputs.bgSettingImage.classList.toggle('hidden', type !== 'image');
    }

    updateSettingsFromInputs() {
        this.settings.width = parseInt(this.inputs.width.value);
        this.settings.height = parseInt(this.inputs.height.value);
        this.settings.bgColor = this.inputs.bgColor.value;
        this.settings.bgBorderEnabled = this.inputs.bgBorderEnabled.checked;
        this.settings.bgBorderColor = this.inputs.bgBorderColor.value;
        this.settings.bgBorderWidth = parseInt(this.inputs.bgBorderWidth.value);
        this.settings.fontFamily = this.inputs.fontSelect.value;
        this.settings.fontWeight = this.inputs.fontWeight.value;
        this.settings.fontSize = parseInt(this.inputs.fontSize.value) || 45;
        this.settings.textColor = this.inputs.textColor.value;
        this.settings.textAlign = this.inputs.textAlign.value;
        this.settings.outlineEnabled = this.inputs.outlineEnabled.checked;
        this.settings.outlineColor = this.inputs.outlineColor.value;
        this.settings.outlineWidth = parseInt(this.inputs.outlineWidth.value);
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

        // Set clipping to canvas bounds
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.clip();

        this.drawBackground(ctx);
        this.drawText(ctx, textBlock);

        ctx.restore();

        const dataUrl = this.canvas.toDataURL('image/png');
        this.generatedImages.push({ id: index, text: textBlock, data: dataUrl });
        this.addPreviewItem(dataUrl, textBlock, index);
    }

    drawBackground(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.settings.bgType === 'color') {
            ctx.fillStyle = this.settings.bgColor;
            ctx.fillRect(0, 0, w, h);
            if (this.settings.bgBorderEnabled) {
                const bw = this.settings.bgBorderWidth;
                ctx.strokeStyle = this.settings.bgBorderColor;
                ctx.lineWidth = bw;
                ctx.strokeRect(bw / 2, bw / 2, w - bw, h - bw);
            }
        } else if (this.settings.bgType === 'image' && this.settings.bgImage) {
            const img = this.settings.bgImage;
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
        }
    }

    drawText(ctx, text) {
        const lines = text.split('\n');
        const padding = 10;

        let fontFamily = this.settings.fontFamily;
        let fallback = 'sans-serif';
        if (fontFamily.includes('Serif')) fallback = 'serif';
        if (fontFamily.includes('Gothic') || fontFamily.includes('One')) fallback = 'cursive';

        ctx.font = `${this.settings.fontWeight} ${this.settings.fontSize}px "${fontFamily}", ${fallback}`;
        ctx.textBaseline = 'top';

        const lineHeight = this.settings.fontSize * 1.2;
        const totalHeight = lines.length * lineHeight;
        let currentY = (this.canvas.height - totalHeight) / 2;

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

            if (this.settings.outlineEnabled) {
                ctx.strokeStyle = this.settings.outlineColor;
                ctx.lineWidth = this.settings.outlineWidth;
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(line, x, currentY);
            }

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
