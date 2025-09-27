// home.js: 控制首页轮播左右按钮滚动（简易版）
(function () {
  const scroller = document.getElementById('home-carousel');
  if (!scroller) return;

  const prev = document.querySelector('[data-role="carousel-prev"]');
  const next = document.querySelector('[data-role="carousel-next"]');
  const step = () => Math.max(240, scroller.clientWidth * 0.8);

  prev && prev.addEventListener('click', () => scroller.scrollBy({ left: -step(), behavior: 'smooth' }));
  next && next.addEventListener('click', () => scroller.scrollBy({ left: step(), behavior: 'smooth' }));
})();
