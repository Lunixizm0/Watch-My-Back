// API - Aynı origin (Frontend sunucusu backende proxy yapar)
const API_URL = '';

// Animasyonlar ve efektlerle modern JavaScript
class BreachChecker {
    constructor() {
        this.form = document.getElementById('checkForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = document.querySelector('.btn-text');
        this.btnLoading = document.querySelector('.btn-loading');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.results = document.getElementById('results');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupFormAnimations();
    }

    setupFormAnimations() {
        // Form girişlerine odaklanma animasyonları ekle
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;

        // Yükleniyor durumunu göster
        this.showLoading();
        this.results.innerHTML = '';

        try {
            // İlerlemeyi simüle et
            this.simulateProgress();

            const response = await fetch(`${API_URL}/api/check-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            // İlerlemeyi tamamla
            this.completeProgress();

            // Sonuçları animasyonla göster
            setTimeout(() => {
                this.showResults(data);
            }, 500);

        } catch (error) {
            this.showError('Veri ihlalleri kontrol edilirken bir hata oluştu. Lütfen tekrar deneyin.');
            console.error('Hata:', error);
        } finally {
            this.hideLoading();
        }
    }

    hideHeroBanner() {
        const heroSection = document.querySelector('.hero-section');
        const mainContent = document.getElementById('mainContent');

        if (heroSection) {
            heroSection.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            heroSection.style.transform = 'translateY(-100vh)';
            heroSection.style.opacity = '0';

            // Hero kaybolduktan sonra ana içeriği animasyonla göster
            setTimeout(() => {
                if (mainContent) {
                    mainContent.style.display = 'block';
                    mainContent.style.opacity = '0';
                    mainContent.style.transform = 'translateY(30px)';
                    mainContent.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

                    // Animasyonu tetikle
                    setTimeout(() => {
                        mainContent.style.opacity = '1';
                        mainContent.style.transform = 'translateY(0)';
                    }, 50);
                }

                // Animasyondan sonra hero'yu DOM'dan kaldır
                heroSection.style.display = 'none';
            }, 1200);
        }
    }

    showLoading() {
        this.submitBtn.disabled = true;
        this.btnText.classList.add('d-none');
        this.btnLoading.classList.remove('d-none');
        this.progressContainer.classList.add('show');
    }

    hideLoading() {
        this.submitBtn.disabled = false;
        this.btnText.classList.remove('d-none');
        this.btnLoading.classList.add('d-none');
        this.progressContainer.classList.remove('show');
    }

    simulateProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                progress = 90;
                clearInterval(interval);
            }
            this.updateProgress(progress);
        }, 200);
    }

    completeProgress() {
        this.updateProgress(100);
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `Veri kaynakları taranıyor... ${Math.round(percent)}%`;
    }

    showResults(data) {
        if (data.status === 'success') {
            if (data.breaches && data.breaches.length > 0) {
                this.showBreachResults(data);
            } else {
                this.showSuccessMessage(data.email);
            }
        } else {
            this.showError(data.message);
        }
    }

    showBreachResults(data) {
        let html = `
            <div class="alert alert-danger mb-4 animate__animated animate__fadeInDown">
                <h4 class="alert-heading mb-0">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    ${data.breaches.length} Veri İhlali Bulundu!
                </h4>
                <p class="mb-0">${data.email} için veri kaynaklarında bulundu</p>
            </div>

            <div class="source-summary mb-4 animate__animated animate__fadeInUp">
                <h6 class="mb-3">
                    <i class="bi bi-shield-exclamation me-2"></i>
                    Bulunduğu Kaynaklar:
                </h6>
                <div class="d-flex flex-wrap gap-2">
                    <span class="badge bg-warning text-dark fs-6">
                        <i class="bi bi-shield-exclamation me-1"></i>
                        HIBP: ${data.breaches.filter(b => b.source === 'HIBP').length}
                    </span>
                </div>
            </div>`;

        // Kademeli animasyon ile ihlal kartlarını ekle
        data.breaches.forEach((breach, index) => {
            html += `
                <div class="card breach-card mb-3 animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0 text-danger">
                                <i class="bi bi-shield-exclamation me-2"></i>
                                ${breach.Name}
                            </h5>
                            <span class="badge bg-warning text-dark">
                                <i class="bi bi-shield-exclamation me-1"></i>
                                Have I Been Pwned
                            </span>
                        </div>

                        <div class="breach-date mb-3 text-light">
                            <i class="bi bi-calendar-event me-2"></i>
                            ${breach.BreachDate}
                        </div>

                        ${breach.DataClasses ? `
                            <div class="compromised-data">
                                <strong class="text-warning">
                                    <i class="bi bi-exclamation-circle me-2"></i>
                                    Ele Geçirilen Veriler:
                                </strong>
                                <ul class="list-unstyled mb-0 mt-2">
                                    ${breach.DataClasses.map(type =>
                `<li class="mb-1">
                                            <span class="bullet text-danger me-2">•</span>
                                            <span class="text-light">${type}</span>
                                        </li>`
            ).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${breach.Description ? `
                            <div class="breach-description mt-3 pt-3 border-top border-secondary">
                                <small class="text-light">${breach.Description}</small>
                            </div>
                        ` : ''}
                    </div>
                </div>`;
        });

        this.results.innerHTML = html;
    }

    showSuccessMessage(email) {
        this.results.innerHTML = `
            <div class="alert alert-success animate__animated animate__fadeInDown">
                <h4 class="alert-heading">
                    <i class="bi bi-check-circle me-2"></i>
                    İyi Haber!
                </h4>
                <p class="mb-0">${email} için hiçbir veri ihlali bulunamadı</p>
                <hr>
                <p class="mb-0">
                    <i class="bi bi-shield-check me-2"></i>
                    Kontrol edilen kaynak: Have I Been Pwned
                </p>
            </div>`;
    }

    showError(message) {
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger animate__animated animate__fadeInDown';
        errorAlert.innerHTML = `
            <h4 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Hata
            </h4>
            <p class="mb-0">${message}</p>
        `;
        this.results.innerHTML = '';
        this.results.appendChild(errorAlert);
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    const app = new BreachChecker();

    // Sayfa yüklendikten sonra hero banner'ı otomatik gizle
    setTimeout(() => {
        app.hideHeroBanner();
    }, 2000);
});
