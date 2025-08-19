const Footer = () => {
    return (
        <div className="footer w-full flex justify-center items-center bg-blue-600 text-white fixed bottom-0 py-3 shadow-md">
            <p className="font-medium text-sm md:text-base">
                ASKYOURPDF © {new Date().getFullYear()}
            </p>
        </div>
    )
}

export default Footer;