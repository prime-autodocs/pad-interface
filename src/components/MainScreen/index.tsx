import './MainScreen.css'

interface MainScreenProps {
    children: React.ReactNode;
}

export const MainScreen = ({ children }: MainScreenProps) => {
    return (
        <div className="main-screen">
            {children}
        </div>
    );
}