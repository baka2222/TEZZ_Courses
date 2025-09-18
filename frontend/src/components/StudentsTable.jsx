import React, { useState, useEffect } from 'react';
import axios from '../api/axios';


function StudentRow({ s, onSave }) {
const [score, setScore] = useState(s.score ?? '');
const [answer, setAnswer] = useState(s.answer ?? '');
const [saving, setSaving] = useState(false);


const save = async () => {
setSaving(true);
const payload = { score, answer };
try {
await axios.patch(`/marks/${s.id}/update/`, payload);
onSave({ ...s, score, answer });
} catch (err) {
console.error(err);
alert('Ошибка при сохранении');
} finally { setSaving(false); }
};


return (
<tr className="border-t border-white/5">
<td className="p-2 py-3">{s.username || s.first_name + ' ' + s.last_name}</td>
<td className="p-2"><input className="p-2 rounded-md bg-white/5 w-full" value={answer} onChange={e=>setAnswer(e.target.value)} /></td>
<td className="p-2"><input className="p-2 rounded-md bg-white/5 w-20" value={score} onChange={e=>setScore(e.target.value)} /></td>
<td className="p-2"><button onClick={save} className="px-3 py-1 rounded-md bg-indigo-500" disabled={saving}>{saving ? '...' : 'Сохранить'}</button></td>
</tr>
);
}


export default function StudentsTable({ initialStudents = [] }) {
const [students, setStudents] = useState(initialStudents);


useEffect(() => setStudents(initialStudents), [initialStudents]);


return (
<div className="overflow-x-auto bg-white/3 rounded-xl p-3">
<table className="w-full table-auto">
<thead>
<tr className="text-left text-slate-300 text-sm">
<th className="p-2">Студент</th>
<th className="p-2">Ответ</th>
<th className="p-2">Оценка</th>
<th className="p-2">Действия</th>
</tr>
</thead>
<tbody>
{students.map(s => (
<StudentRow key={s.id} s={s} onSave={(m) => setStudents(sts => sts.map(x => x.id === m.id ? m : x))} />
))}
</tbody>
</table>
</div>
);
}