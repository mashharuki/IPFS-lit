/**
 * Header コンポーネント
 * @param {*} param0 
 * @returns 
 */
const Header = ({title}) => {
    return (
        <>
            <div>
                <img src="litLogo.png" alt="Lit Logo"/>
            </div>

            <h1>
                { title }
            </h1>
        </>
    );
}

export default Header;
