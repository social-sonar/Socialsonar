export default function LoadingSpinner({ size }: { size: number }) {
    const dimmensions = `h-[${size}px] w-[${size}px]`
    return (
        <div className={`border-gray-300 rounded-full border-2 animate-spin border-t-blue-600 ${dimmensions}`} />
    )
}