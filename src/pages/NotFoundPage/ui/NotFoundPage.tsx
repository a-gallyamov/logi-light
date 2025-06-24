import { Button, Result } from 'antd';
import { Link } from 'react-router';

const NotFoundPage = () => {
  return (
    <Result
      status="warning"
      title="Раздел не найден"
      extra={
        <Button type="default" size="large">
          <Link to="/">На главную</Link>
        </Button>
      }
    />
  );
};

export default NotFoundPage;
