import {useNavigate} from 'react-router-dom';
import {Paths} from '@common/routing'

export function OnboardingStartPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center">
                <button className="btn btn-blue mt-4" onClick={() => navigate(Paths.ONBOARDING_CREATE_WALLET)}>
                    Create Wallet
                </button>
                <button className="btn btn-blue mt-4" onClick={() => navigate(Paths.ONBOARDING_IMPORT_WALLET)}>
                    Import Wallet
                </button>
            </div>
        </>
    );
}