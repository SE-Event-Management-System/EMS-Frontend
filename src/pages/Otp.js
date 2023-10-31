import Header from "../components/Header"
import OTPVerification from "../components/OtpPage"

export default function OtpPage(){
    return(
        <>
            <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full space-y-8" style={{"maxWidth": "30rem"}}>
                    <Header
                        heading="Verify your account"
                        paragraph="Check your registered email account"
                        />
                    <OTPVerification/>
                </div>
            </div>
        </>
    )
}