import catalog from './portfolio.json';

export interface PortfolioImage {
  id: string;
  name: string;
  filename: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
  source: string;
  sourceSha256: string;
}
export interface PortfolioGroup { id: string; name: string; images: PortfolioImage[] }
export interface PortfolioProject { id: string; name: string; sourceFolder: string; coverId: string; groups: PortfolioGroup[] }
export interface PortfolioCategory { id: string; name: string; english: string; description: string; projects: PortfolioProject[] }

export const portfolio: PortfolioCategory[] = catalog.categories;
export const projectImages = (project: PortfolioProject) => project.groups.flatMap((group) => group.images);
export const projectCover = (project: PortfolioProject) => projectImages(project).find((image) => image.id === project.coverId) ?? project.groups[0].images[0];
export const categoryImageCount = (category: PortfolioCategory) => category.projects.reduce((sum, project) => sum + projectImages(project).length, 0);
export const portfolioProjectCount = portfolio.reduce((sum, category) => sum + category.projects.length, 0);
export const portfolioImageCount = portfolio.reduce((sum, category) => sum + categoryImageCount(category), 0);
