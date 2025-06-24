import './global.scss';
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19';
import { MainPage } from '@pages/MainPage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { MainLayout } from '@shared/layouts/MainLayout';
import { LoadingOrError } from '@shared/ui/LoadingOrError';
import { App as AntdApp, ConfigProvider } from 'antd';
import ruRu from 'antd/lib/locale/ru_RU';
import { Suspense } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Route, Routes } from 'react-router';

function renderError({ error }: FallbackProps) {
  return <LoadingOrError error={error} />;
}

export function App() {
  return (
    <ConfigProvider locale={ruRu}>
      <AntdApp rootClassName="clientApp inheritHeight">
        <ErrorBoundary fallbackRender={renderError}>
          <Suspense fallback={<LoadingOrError />}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route element={<MainPage />} index={true} />
                {/*//<Route element={<Details />} path=':fruitName' />*/}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
}
