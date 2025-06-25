import { HeaderWidget } from '@widgets/HeaderWidget';
import { Flex, Layout } from 'antd';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { VERSION } from '@app/constants';
import cls from './MainLayout.module.scss';

const { Content } = Layout;
const { Footer } = Layout;

const MainLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <Layout className="mainLayout inheritHeight">
      <HeaderWidget />

      <Content className={cls.content}>
        <Outlet />
        {children}
      </Content>

      <Footer>
        <Flex justify="center">Logi v {VERSION}</Flex>
      </Footer>
    </Layout>
  );
};

// eslint-disable-next-line import-x/no-default-export
export default MainLayout;
