import ContentLoader from 'react-content-loader'

export default function ContactListSkeleton(amout: number = 10) {
  return Array(amout)
    .fill(null)
    .map(() => {
      return (
        <>
          <ContentLoader
            speed={3}
            width={866}
            height={100}
            viewBox="0 0 866 100"
            backgroundColor="#404040"
            foregroundColor="#b5b5b5"
          >
            <rect x="88" y={20} rx="3" ry="3" width="220" height="6" />
            <rect x="88" y={52} rx="3" ry="3" width="150" height="6" />
            <circle cx="32" cy={40} r="28" />
            <rect x="760" y={20} rx="3" ry="3" width="120" height="6" />
            <rect x="750" y={52} rx="3" ry="3" width="150" height="6" />
          </ContentLoader>
        </>
      )
    })
}
