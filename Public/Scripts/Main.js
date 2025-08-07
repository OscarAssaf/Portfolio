//animation for the scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    document.querySelector('.about').scrollIntoView({
      behavior: 'smooth'
    });
  });
}

// Infinite scroll for technologies section
const scrollers = document.querySelectorAll(".scroller");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    scroller.setAttribute("data-animated", true);

    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}

//particle effect
function createParticle() {
  const particle = document.createElement('div');
  particle.style.position = 'fixed';
  particle.style.width = '2px';
  particle.style.height = '2px';
  particle.style.background = '#64ffda';
  particle.style.pointerEvents = 'none';
  particle.style.opacity = '0.6';
  particle.style.borderRadius = '50%';
  particle.style.left = Math.random() * window.innerWidth + 'px';
  particle.style.top = window.innerHeight + 'px';
  particle.style.zIndex = '1';

  document.body.appendChild(particle);

  const animation = particle.animate([
    { transform: 'translateY(0px)', opacity: 0.6 },
    { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: 0 }
  ], {
    duration: Math.random() * 3000 + 2000,
    easing: 'linear'
  });

  animation.onfinish = () => particle.remove();
}

//interval of particles
setInterval(createParticle, 200);

// Projects page functionality    
class ProjectManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
  }

  async loadProjects() {
    try {
      const response = await fetch('./Data/projects.json');
      if (!response.ok) {
        throw new Error('Failed to load projects');
      }
      const data = await response.json();
      this.projects = data.projects;
      return this.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  filterProjects(category) {
    if (category === 'all') {
      return this.projects;
    }
    return this.projects.filter(project => 
      project.category.includes(category)
    );
  }

  createProjectCard(project) {
    const statusClass = `status-${project.status.replace(' ', '')}`;
    const categoryString = project.category.join(' ');
    
    // links
    let linksHtml = '<div class="project-links">';
    if (project.links.live) {
      linksHtml += `<a href="${project.links.live}" class="project-link">🔗 Live Site</a>`;
    }
    if (project.links.demo) {
      linksHtml += `<a href="${project.links.demo}" class="project-link">🔗 Demo</a>`;
    }
    if (project.links.github) {
      linksHtml += `<a href="${project.links.github}" class="project-link">💻 GitHub</a>`;
    }
    linksHtml += '</div>';
  
    //Tech tags
    const techTags = project.technologies.map(tech => 
      `<span class="tech-tag">${tech}</span>`
    ).join('');

    return `
      <div class="project-card" data-category="${categoryString}">
        <div class="project-status ${statusClass}">${project.status}</div>
        <div class="project-image">
          <img src="${project.image}" alt="${project.title} Screenshot" loading="lazy">
        </div>
        <div class="project-content">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">${techTags}</div>
          ${linksHtml}
        </div>
      </div>
    `;
  }

  renderProjects(container, projects = null) {
    const projectsToRender = projects || this.projects;
    const projectsHtml = projectsToRender
      .map(project => this.createProjectCard(project))
      .join('');
    
    container.innerHTML = projectsHtml;
    
    // fade in
    const newCards = container.querySelectorAll('.project-card');
    newCards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    });
  }

  // featured projects
  getFeaturedProjects(limit = 3) {
    return this.projects
      .filter(project => project.featured)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  // Filter button categories
  getCategories() {
    const categories = new Set();
    this.projects.forEach(project => {
      project.category.forEach(cat => categories.add(cat));
    });
    return Array.from(categories);
  }
}

//Instantiate the projectmanager
const projectManager = new ProjectManager();

// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', async function () {
  // Load projects data
  await projectManager.loadProjects();
  

  const projectsGrid = document.querySelector('.projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  if (projectsGrid && filterBtns.length > 0) {
    // Render all projects
    projectManager.renderProjects(projectsGrid);
    
    // filter buttons functionality
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Current button recently pressed
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        projectManager.currentFilter = filter;

        // Filter and show projects
        const filteredProjects = projectManager.filterProjects(filter);
        projectManager.renderProjects(projectsGrid, filteredProjects);
      });
    });
  }
  

  const homeProjectsGrid = document.querySelector('.projects .projects-grid');
  if (homeProjectsGrid && !projectsGrid) { 
    const featuredProjects = projectManager.getFeaturedProjects();
    projectManager.renderProjects(homeProjectsGrid, featuredProjects);
  }
});


if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProjectManager };
}