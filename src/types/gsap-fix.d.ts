declare module 'gsap' {
  export * from 'gsap/types/index';
  import gsap from 'gsap/types/index';
  export default gsap;
}

declare module 'gsap/ScrollTrigger' {
  export * from 'gsap/types/scroll-trigger';
  import { ScrollTrigger } from 'gsap/types/scroll-trigger';
  export default ScrollTrigger;
}

declare module 'gsap/SplitText' {
  export * from 'gsap/types/split-text';
  import { SplitText } from 'gsap/types/split-text';
  export default SplitText;
}
