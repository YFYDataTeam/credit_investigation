import '../../assets/css/container.css';

const Container = ({title, children}) => {
    return (
        <div className="container">
            <div className="section">
                <h2 className="section-title">{title}</h2>
                <div className="section-content">{children}</div>
            </div>
        </div>
    );
};

export default Container;