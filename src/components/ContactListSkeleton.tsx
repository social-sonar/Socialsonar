import ContentLoader from 'react-content-loader'

export default function ContactListSkeleton(amout: number = 10) {
  return (
    <>
      {Array(amout)
        .fill(null)
        .map((a, index) => {
          return (
            <>
              <ContentLoader
                key={index + 'loader'}
                speed={3}
                width={866}
                height={100}
                viewBox="0 0 866 100"
                backgroundColor="#404040"
                foregroundColor="#b5b5b5"
              >
                <rect
                  key={index + 'x1'}
                  x="88"
                  y={20}
                  rx="3"
                  ry="3"
                  width="220"
                  height="6"
                />
                <rect
                  key={index + 'x2'}
                  x="88"
                  y={52}
                  rx="3"
                  ry="3"
                  width="150"
                  height="6"
                />
                <circle key={index + 'x3'} cx="32" cy={40} r="28" />
                <rect
                  key={index + 'x4'}
                  x="760"
                  y={20}
                  rx="3"
                  ry="3"
                  width="120"
                  height="6"
                />
                <rect
                  key={index + 'x5'}
                  x="750"
                  y={52}
                  rx="3"
                  ry="3"
                  width="150"
                  height="6"
                />
              </ContentLoader>
            </>
          )
        })}
    </>
  )
}
