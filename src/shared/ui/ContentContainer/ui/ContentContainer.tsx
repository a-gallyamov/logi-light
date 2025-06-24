import cls from './ContentContainer.module.scss';
import type { ReactNode } from 'react';

export const ContentContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className={cls.container}>
      <>{children}</>
    </div>
  );
};
