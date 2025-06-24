import { LoadingOutlined } from '@ant-design/icons';
import { Button, Flex, Result, Typography, Watermark } from 'antd';
import cls from './loader.module.scss';

const { Paragraph, Text } = Typography;

interface Properties {
	error?: Error;
}

const handleRefreshPage = () => window.location.reload();
const extraButtons = [
	<Button key='buy' onClick={handleRefreshPage}>
		Перезагрузить страницу
	</Button>,
];

const isDevMode = import.meta.env.DEV;

export const LoadingOrError = ({ error }: Properties) => {
	if (error) {
		return (
			<div className={cls.errBoundary}>
				<Result
					title='Ошибка'
					status='warning'
					extra={extraButtons}
					subTitle='Произошла непредвиненная ошибка приложения'
				>
					{Boolean(error?.message && isDevMode) && (
						<Watermark content='Dev mode only' gap={[70, 80]}>
							<div className='desc'>
								<Paragraph>
									<Text strong={true}>Текст ошибки: </Text>
								</Paragraph>

								<Paragraph>{error?.message}</Paragraph>
							</div>
						</Watermark>
					)}
				</Result>
			</div>
		);
	}

	return (
		<Flex
			align='center'
			justify='center'
			style={{ position: 'fixed', width: '100%', height: '100%' }}
		>
			<LoadingOutlined style={{ fontSize: 54 }} />
		</Flex>
	);
};
