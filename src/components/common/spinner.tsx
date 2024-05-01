export default function LoadingSpinner({ size }: { size: number }) {
    const spinnerDimmensions = {
        width: `${size}px`,
        height: `${size}px`,
    }
    return (
        <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" style={spinnerDimmensions} />
    )
}