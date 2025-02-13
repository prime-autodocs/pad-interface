import { MainScreen } from '../../components/MainScreen';
import Menu from '../../components/Sidebar';
import './Home.css';

const Home = () => {
    return (
        <>
            <Menu />
            <MainScreen children={<div className='home'><h1>Esta é a Home</h1></div>}/>
        </>
    );
};

export default Home;
