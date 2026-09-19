import { useState, useEffect } from "react";
import "./App.css";
function Crud() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [isDeleted, setDeleted] = useState(false);
    const [selectId, setSelect] = useState("");
    const [form, setForm] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const respone = await fetch("https://671891927fc4c5ff8f49fcac.mockapi.io/v2");
                const data = await respone.json();

                setUsers(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        try {
            const respone = await fetch("https://671891927fc4c5ff8f49fcac.mockapi.io/v2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const newUser = await respone.json();

            setUsers([...users, newUser]);
            setOpen(false);
        } catch (error) {
            console.log("Loi khi them user: ", error);
        }
    };
    const handleDelet = async () => {
        try {
            const respone = await fetch(`https://671891927fc4c5ff8f49fcac.mockapi.io/v2/${selectId}`, {
                method: "DELETE",
            });

            if (!respone.ok) {
                console.log("Xoa that bai");
            }

            setUsers(users.filter((user) => user.id !== selectId));

            setDeleted(false);
        } catch (error) {
            console.log("Loi khi xoa user: ", error);
        }
    };
    const allKeys = [...new Set(users.flatMap((user) => Object.keys(user)))];

    const orderedKeys = ["id", ...allKeys.filter((key) => key !== "id")];
    return (
        <div className="main">
            <div className="box-btn">
                <button className="btn btn-add" onClick={() => setOpen(true)}>Thêm User</button>
                <button className="btn btn-del" onClick={() => setDeleted(true)}>Xóa User</button>
            </div>
            {isOpen && (
                <div className="overlay">
                    <div className="modal">
                        <div className="box-input">
                            {orderedKeys.map(key => (
                                (key !== 'id' && key !== 'createdAt') && (
                                    <div className="block-input" key={key}>
                                        <label >{key[0].toUpperCase() + key.slice(1)}</label>
                                        <input type="text" placeholder={key} value={form[key]} onChange={(e) => {setForm({...form, [key]:e.target.value})}}/>
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="box-btn m-auto">
                            <button
                                className="btn"
                                onClick={() => {
                                    setOpen(false);
                                    setForm({});
                                }}
                            >
                                Đóng
                            </button>
                            <button className="btn" onClick={handleSubmit}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleted && (
                <div className="overlay">
                    <div className="modal modal-delet">
                        <select className="content-select" value={selectId} onChange={(e) => setSelect(e.target.value)}>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.id} - {user.name}
                                </option>
                            ))}
                        </select>

                        <div className="box-btn m-auto">
                            <button className="btn" onClick={handleDelet}>Xóa</button>
                            <button
                                onClick={() => {
                                    setDeleted(false);
                                }}
                                className="btn"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <table border={1}>
                    <thead>
                        <tr>
                            {orderedKeys.map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ backgroundColor: user.color }}>
                                {orderedKeys.map((key) => (
                                    <td key={key}>{key === "createdAt" ? new Date(user[key]).toLocaleString("vi-VN") : key === "avatar" ? <img src={user[key]} width={52} height={52} /> : typeof user[key] === "object" && user[key] !== null ? JSON.stringify(user[key]) : user[key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default Crud;
