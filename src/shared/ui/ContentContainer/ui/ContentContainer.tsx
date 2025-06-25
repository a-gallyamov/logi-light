import type { ReactNode } from 'react';
import cls from './ContentContainer.module.scss';

export const ContentContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className={cls.container}>
      <>{children}</>
    </div>
  );
};
