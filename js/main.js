/* ============================================= */
/* 百丽 BeLLE 亚马逊市场洞察报告 - 交互脚本      */
/* 导航 · 滚动动画 · 图表 · 手风琴 · 进度条     */
/* ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ===== 1. 阅读进度条 ===== */
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      progressBar.style.width = progress + '%';
    });
  }

  /* ===== 2. 导航滚动高亮 ===== */
  const sections = document.querySelectorAll('.section, .hero, .summary-section');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navHeader = document.querySelector('.nav-header');

  function updateActiveNav() {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (sec) {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    // 导航阴影
    if (navHeader) {
      if (window.scrollY > 60) {
        navHeader.classList.add('scrolled');
      } else {
        navHeader.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  /* ===== 3. 汉堡菜单 ===== */
  const hamburger = document.querySelector('.hamburger');
  const navLinksContainer = document.querySelector('.nav-links');

  if (hamburger && navLinksContainer) {
    hamburger.addEventListener('click', function () {
      navLinksContainer.classList.toggle('open');
    });

    // 点击导航链接后关闭菜单
    navLinksContainer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinksContainer.classList.remove('open');
      });
    });
  }

  /* ===== 4. 滚动渐入动画（Intersection Observer） ===== */
  const animateElements = document.querySelectorAll('.fade-in-up');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // 降级：直接显示
    animateElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ===== 5. 数字递增动画 ===== */
  const numberElements = document.querySelectorAll('.data-card .number, .summary-item .num');

  function animateNumber(el) {
    const text = el.textContent.trim();
    const numMatch = text.match(/[\d.]+/);
    if (!numMatch) return;

    const target = parseFloat(numMatch[0]);
    const suffix = text.replace(numMatch[0], '');
    const duration = 1500;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(target * eased);

      if (suffix.includes('.')) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = current + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = numMatch[0] + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // 使用 IntersectionObserver 触发数字动画
  if ('IntersectionObserver' in window) {
    const numberObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            numberObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    numberElements.forEach(function (el) {
      numberObserver.observe(el);
    });
  } else {
    numberElements.forEach(function (el) {
      el.style.opacity = '1';
    });
  }

  /* ===== 6. 手风琴（折叠）交互 ===== */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // 关闭其他所有项
      accordionHeaders.forEach(function (h) {
        h.parentElement.classList.remove('active');
      });

      // 切换当前项
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  /* ===== 7. 回到顶部按钮 ===== */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== 8. Chart.js 图表初始化 ===== */
  function initCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    // 8a. 情感分布环形图（情感分析）
    const sentimentCtx = document.getElementById('sentimentChart');
    if (sentimentCtx) {
      new Chart(sentimentCtx, {
        type: 'doughnut',
        data: {
          labels: ['正面评价', '中性评价', '负面评价'],
          datasets: [{
            data: [62, 23, 15],
            backgroundColor: ['#2D6A4F', '#D4A843', '#E74C3C'],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16, usePointStyle: true, font: { size: 12 } }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.label + ': ' + context.parsed + '%';
                }
              }
            }
          }
        }
      });
    }

    // 8b. 关键词词频柱状图
    const keywordCtx = document.getElementById('keywordChart');
    if (keywordCtx) {
      new Chart(keywordCtx, {
        type: 'bar',
        data: {
          labels: ['舒适度', '尺码合脚', '外观设计', '材质质感', '耐用性', '性价比', '物流包装'],
          datasets: [{
            label: '提及频率',
            data: [92, 78, 65, 54, 48, 35, 28],
            backgroundColor: ['#C41E3A', '#D4354F', '#E05A70', '#E87E90', '#F0A2B0', '#F5C0C8', '#FAE0E4'],
            borderRadius: 4,
            barThickness: 32
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return '提及率: ' + context.parsed + '%';
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              max: 100,
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: { font: { size: 11 }, callback: function (v) { return v + '%'; } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }

    // 8c. 问答类别条形图
    const qaCtx = document.getElementById('qaChart');
    if (qaCtx) {
      new Chart(qaCtx, {
        type: 'bar',
        data: {
          labels: ['尺码咨询', '材质护理', '退换政策', '物流配送', '搭配建议', '库存查询'],
          datasets: [{
            label: '问题数量',
            data: [85, 62, 48, 35, 22, 18],
            backgroundColor: ['#C41E3A', '#D4354F', '#E05A70', '#E87E90', '#F0A2B0', '#F5C0C8'],
            borderRadius: 4,
            barThickness: 32
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return '数量: ' + context.parsed;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.06)' },
              ticks: { font: { size: 11 } }
            },
            y: {
              grid: { display: false },
              ticks: { font: { size: 11 } }
            }
          }
        }
      });
    }

    // 8d. 功能对比雷达图
    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
      new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: ['舒适度', '外观设计', '材质用料', '品牌口碑', '价格优势', '尺码精准'],
          datasets: [
            {
              label: '百丽 BeLLE',
              data: [92, 85, 88, 78, 70, 90],
              borderColor: '#C41E3A',
              backgroundColor: 'rgba(196,30,58,0.15)',
              pointBackgroundColor: '#C41E3A',
              pointRadius: 4,
              borderWidth: 2
            },
            {
              label: 'Clarks',
              data: [85, 70, 90, 88, 55, 75],
              borderColor: '#2D6A4F',
              backgroundColor: 'rgba(45,106,79,0.10)',
              pointBackgroundColor: '#2D6A4F',
              pointRadius: 4,
              borderWidth: 2
            },
            {
              label: 'Skechers',
              data: [88, 65, 65, 82, 78, 72],
              borderColor: '#4A6CF7',
              backgroundColor: 'rgba(74,108,247,0.10)',
              pointBackgroundColor: '#4A6CF7',
              pointRadius: 4,
              borderWidth: 2
            },
            {
              label: 'ECCO',
              data: [80, 72, 92, 75, 45, 70],
              borderColor: '#D4A843',
              backgroundColor: 'rgba(212,168,67,0.10)',
              pointBackgroundColor: '#D4A843',
              pointRadius: 4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 14, usePointStyle: true, font: { size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return context.dataset.label + ': ' + context.parsed;
                }
              }
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: { stepSize: 20, font: { size: 9 }, backdropColor: 'transparent' },
              grid: { color: 'rgba(0,0,0,0.08)' },
              angleLines: { color: 'rgba(0,0,0,0.08)' },
              pointLabels: { font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // 等待 Chart.js 加载完毕后初始化
  if (typeof Chart !== 'undefined') {
    initCharts();
  } else {
    window.addEventListener('load', function () {
      // 给CDN加载留时间
      setTimeout(initCharts, 500);
    });
  }

});