const RoomComponent = (props) => {
    const handleDisconnect = () => {
        socketInstance.current?.destoryConnection();
        props.history.push('/');
    }

    let socketInstance = useRef(null);    
    useEffect(() => {
        startConnection();
    }, []);
    const startConnection = () => {
        params = {quality: 12}
        socketInstance.current = createSocketConnectionInstance({
            params
        });
    }
    
    return (
        <React.Fragment>
            <div id="room-container"></div>
            <button onClick={handleDisconnect}>Disconnect</button>
        </React.Fragment>
    )
}

export default RoomComponent;