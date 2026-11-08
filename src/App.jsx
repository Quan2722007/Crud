import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faX, faFilter, faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import "./App.css";
function Crud() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [form, setForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [selectArray, setSelectArray] = useState([]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ genre: "", address: "" });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const url = search ? `https://671891927fc4c5ff8f49fcac.mockapi.io/v2?page=${page}&limit=10&name=${search}` : `https://671891927fc4c5ff8f49fcac.mockapi.io/v2?page=${page}&limit=10`
                const respone = await fetch(url);
                const data = await respone.json();

                if (respone.ok && Array.isArray(data)) {
                    let result = data;
                    if (filters.genre) {
                        result = result.filter(user => user.genre === filters.genre);
                    }
                    if (filters.address) {
                        result = result.filter(user => user.address.toLowerCase().includes(filters.address.toLowerCase()));
                    }
                    if (data.length < 10) setHasMore(data.length === 10);

                    if (page === 1) {
                        setUsers(result);
                    } else {
                        setUsers(prev => [...prev, ...result]);
                    }
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        }
        const timer = setTimeout(() => {
            fetchData();
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [search, filters, page]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
    }, [search, filters]);

    useEffect(() => {

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
            }
        })
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [loading, hasMore, users.length])

    const handleSubmit = async () => {
        try {
            if (editingId !== null) {
                const respone = await fetch(`https://671891927fc4c5ff8f49fcac.mockapi.io/v2/${editingId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                });

                const updatedUser = await respone.json();

                setUsers(users.map((user) => user.id === editingId ? updatedUser : user));
            } else {
                const respone = await fetch("https://671891927fc4c5ff8f49fcac.mockapi.io/v2", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                });

                const newUser = await respone.json();

                setUsers([...users, newUser]);

            }

            setOpen(false);
            setForm({});
            setEditingId(null);
            setSelectArray([]);
        } catch (error) {
            console.log("Loi khi them user: ", error);
        }
    };
    const handleDelete = async () => {
        if (selectArray.length === 0) {
            alert("Vui lòng tick chọn ít nhất 1 user để xóa!");
            return;
        }

        try {
            await Promise.all(selectArray.map((id) => {
                fetch(`https://671891927fc4c5ff8f49fcac.mockapi.io/v2/${id}`, {
                    method: "DELETE",
                });
            }))

            setUsers(users.filter((user) => !selectArray.includes(user.id)));
            setSelectArray([]);
        } catch (error) {
            console.log("Loi khi xoa user: ", error);
        }
    };

    const handleCheckUser = (e, id) => {
        if (e.target.checked) {
            setSelectArray([...selectArray, id]);
        } else {
            setSelectArray(selectArray.filter((item) => item !== id));

        }
    }

    const handleUpdate = async () => {
        if (selectArray.length !== 1) {
            alert("Vui lòng tick chọn đúng 1 user để sửa!");
            return;
        }

        const userId = selectArray[0];
        const userToUpdate = users.find((user) => user.id === userId);

        setForm(userToUpdate);
        setEditingId(userId);
        setOpen(true);
    }
    const allKeys = [...new Set(users.flatMap((user) => Object.keys(user)))];

    const orderedKeys = ["id", ...allKeys.filter((key) => key !== "id")];
    return (
        <div className="main">
            <div className="box-btn">
                <div className="input">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input type="text" placeholder="Search name" value={search} onChange={(e) => setSearch(e.target.value)} />
                    {search && <FontAwesomeIcon icon={faX} className="delete-search" onClick={() => setSearch("")} />}
                </div>
                <button className="btn" onClick={() => setIsFilterOpen(true)}>
                    <FontAwesomeIcon icon={faFilter} />
                </button>
                <button className="btn btn-add" onClick={() => setOpen(true)}>Thêm User</button>
                <button className="btn btn-update" onClick={() => handleUpdate()}>Sửa User</button>
                <button className="btn btn-del" onClick={() => handleDelete()}>Xóa User</button>
            </div>
            {isOpen && (
                <div className="overlay">
                    <div className="modal">
                        <div className="box-input">
                            {orderedKeys.map(key => (
                                (key !== 'id' && key !== 'createdAt') && (
                                    <div className="block-input" key={key}>
                                        <label >{key[0].toUpperCase() + key.slice(1)}</label>
                                        <input type="text" placeholder={key} value={form[key]} onChange={(e) => { setForm({ ...form, [key]: e.target.value }) }} />
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="box-btn-modal m-auto">
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
            {loading && page === 1 ? (
                <p style={{ display: "flex", justifyContent: "center", height: "60vh", alignItems: "center", fontSize: "18px" }}>Đang tải...</p>
            ) : (
                (users.length === 0) ?
                    (
                        <p style={{ display: "flex", justifyContent: "center", height: "60vh", alignItems: "center", fontSize: "18px" }}>Không tìm thấy dữ liệu!</p>
                    )
                    : (
                        <div>
                            <table border={1}>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        {orderedKeys.map((key) => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} style={{ backgroundColor: user.color }}>
                                            <td className="boxCheck">
                                                <input type="checkbox" id={user.id} value={user.id} className="check" checked={selectArray.includes(user.id)} onChange={(e) => handleCheckUser(e, user.id)} />
                                            </td>
                                            {orderedKeys.map((key) => (
                                                <td key={key}>{key === "createdAt" ? new Date(user[key]).toLocaleString("vi-VN") : key === "avatar" ? <img src={user[key]} width={52} height={52} /> : typeof user[key] === "object" && user[key] !== null ? JSON.stringify(user[key]) : user[key]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div ref={observerTarget} style={{ textAlign: "center" }}>
                                {loading && page > 1 && <p>Đang tải...</p>}
                            </div>
                        </div>
                    )
            )}
            {isFilterOpen && (
                <div className="overlay">
                    <div className="modal">
                        <div className="filter-modal">
                            <div className="box-select">
                                <label>Giới tính</label>
                                <select value={filters.genre} onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
                                    <option value="">Tất cả</option>
                                    <option value="male">male</option>
                                    <option value="female">female</option>
                                </select>
                            </div>
                            <div className="box-select">
                                <label>Địa chỉ</label>
                                <select value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })}>
                                    <option value="">Tất cả</option>
                                    <option value="East">East</option>
                                    <option value="West">West</option>
                                    <option value="North">North</option>
                                    <option value="South">South</option>
                                </select>
                            </div>
                            <button className="btn" onClick={() => {
                                setFilters({ genre: "", address: "" });
                            }}>
                                <FontAwesomeIcon icon={faArrowRotateLeft} />
                            </button>
                        </div>
                        <div className="box-btn-modal m-auto">
                            <button
                                className="btn"
                                onClick={() => {
                                    setIsFilterOpen(false);
                                    setForm({});
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Crud;
