/**
 * Animation Components
 *
 * Reusable animation components using Framer Motion
 *
 * Usage:
 * ```tsx
 * import { FadeIn, StaggerChildren, StaggerItem } from '@/components/animations'
 *
 * <FadeIn delay={0.2}>
 *   <Component />
 * </FadeIn>
 *
 * <StaggerChildren>
 *   <StaggerItem><Card /></StaggerItem>
 *   <StaggerItem><Card /></StaggerItem>
 * </StaggerChildren>
 * ```
 */

export { FadeIn } from './FadeIn'
export { ScaleIn } from './ScaleIn'
export { SlideIn } from './SlideIn'
export { StaggerChildren, StaggerItem } from './StaggerChildren'
