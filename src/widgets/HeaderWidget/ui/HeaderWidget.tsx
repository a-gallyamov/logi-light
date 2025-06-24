import { RouterPaths } from '@app/Router/RouterPaths';
import { ConfigProvider, Layout, Menu } from 'antd';
import { memo } from 'react';
import { Link, useLocation } from 'react-router';

import LOGI from '@shared/icons/LOGI.svg';
import cls from './HeaderWidget.module.scss';

const { Header } = Layout;

const themeConfig = {
  components: {
    Layout: {
      headerBg: 'rgb(20,20,20)',
      headerColor: 'rgb(20,20,20)',
      colorText: 'rgba(255,255,255,0.88)',
    },
    Menu: {
      darkItemBg: 'rgb(20,20,20)',
      darkItemSelectedColor: 'rgb(255,255,255)',
      darkItemSelectedBg: 'rgb(35,35,35)',
    },
  },
};

const menuItems = [
  {
    key: RouterPaths.HOME,
    label: <Link to={RouterPaths.HOME}>Мониторинг</Link>,
  },
  // {
  //   key: RouterPaths.PROFILE + '1',
  //   label: <Link to={RouterPaths.PROFILE}>Режимы</Link>,
  // },
  // {
  //   key: RouterPaths.PROFILE + '2',
  //   label: <Link to={RouterPaths.PROFILE}>Настройки АКБ</Link>,
  // },
  // {
  //   key: RouterPaths.PROFILE + '3',
  //   label: <Link to={RouterPaths.PROFILE}>Профили</Link>,
  // },
  // {
  //   key: RouterPaths.PROFILE + '4',
  //   label: <Link to={RouterPaths.PROFILE}>Статистика</Link>,
  // },
  // {
  //   key: RouterPaths.PROFILE + '5',
  //   label: <Link to={RouterPaths.PROFILE}>Диагностика</Link>,
  // },
  // {
  //   key: RouterPaths.PROFILE + '6',
  //   label: <Link to={RouterPaths.PROFILE}>Сервис</Link>,
  // },
];

const HeaderWidget = memo(() => {
  const { pathname } = useLocation();

  return (
    <ConfigProvider theme={themeConfig}>
      <Header className={cls.mainHeader}>
        <div className={cls.headerWrap}>
          <Link to={RouterPaths.HOME} className={cls.headerLogoLink}>
            <LOGI width={90} />
          </Link>

          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            className={cls.menu}
            selectedKeys={[pathname]}
            defaultSelectedKeys={[pathname]}
          />
        </div>
      </Header>
    </ConfigProvider>
  );
});

export default HeaderWidget;
