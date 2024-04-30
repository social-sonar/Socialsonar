export default function LoadingSpinner({ size }: { size: number }) {
    return (
        <div className={`border-gray-300 h-[${size}px] w-[${size}px] animate-spin rounded-full border-2 border-t-blue-600`} />
    )
}