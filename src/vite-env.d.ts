declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<React.ComponentProps<'svg'> & { title?: string }>;
  export default ReactComponent;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// declare module '*.svg' {
//   const content: any;
//   export default content;
// }

declare module '*.svg?url' {
  const src: string;
  export default src;
}

declare module '*.csv?raw' {
  const src: string;
  export default src;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
