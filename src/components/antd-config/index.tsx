import { ConfigProvider } from 'antd'

export function AntdConfig({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ConfigProvider
        wave={{ disabled: true }}
        button={{}}
        theme={{
          components: {
            Button: {
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 12,
            },
          },
          token: {
            fontSize: 16,
            colorPrimary: '#2f3b55',
            colorError: '#db583d',
            colorInfo: '#468c98',
            colorSuccess: '#8bcea5',
            colorWarning: '#f5af40',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </>
  )
}
