import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
const db = SQLite.openDatabase({name: 'cartelera.db', location: 'default'}).then(async archivo => {
  await archivo.executeSql(`CREATE TABLE IF NOT EXISTS charlas (
    id TEXT PRIMARY KEY, title TEXT, track TEXT, day INTEGER, time TEXT,
    room TEXT, speaker TEXT, summary TEXT, favorita INTEGER DEFAULT 0)`);
  await archivo.executeSql('CREATE TABLE IF NOT EXISTS ajustes (nombre TEXT PRIMARY KEY, valor TEXT)');
  return archivo;
});

export type Ficha = {id: string; title: string; track: string; day: number; time: string;
  room: string; speaker: string; summary: string};
export type Charla = Ficha & {favorita: number};

export async function listar(): Promise<Charla[]> {
  const [resultado] = await (await db).executeSql('SELECT * FROM charlas ORDER BY day,time,room');
  return resultado.rows.raw();
}
export async function guardar(fichas: Ficha[]) {
  const archivo = await db;
  await archivo.transaction(tx => {
    // La respuesta completa es una instantánea: estos son todos los IDs vigentes.
    tx.executeSql('CREATE TEMP TABLE IF NOT EXISTS ids_edicion (id TEXT PRIMARY KEY)');
    tx.executeSql('DELETE FROM ids_edicion');
    for (const f of fichas) {
      tx.executeSql('INSERT INTO ids_edicion (id) VALUES (?)', [f.id]);
      // Las filas nuevas empiezan sin marcar; las existentes conservan favorita.
      tx.executeSql('INSERT OR IGNORE INTO charlas VALUES (?,?,?,?,?,?,?,?,0)',
        [f.id,f.title,f.track,f.day,f.time,f.room,f.speaker,f.summary]);
      tx.executeSql(`UPDATE charlas SET title=?, track=?, day=?, time=?, room=?, speaker=?, summary=?
        WHERE id=?`, [f.title,f.track,f.day,f.time,f.room,f.speaker,f.summary,f.id]);
    }
    // Si una charla desaparece, también se elimina su marca. Una edición vacía elimina todas.
    tx.executeSql('DELETE FROM charlas WHERE id NOT IN (SELECT id FROM ids_edicion)');
    tx.executeSql('INSERT OR REPLACE INTO ajustes (nombre, valor) VALUES (?, ?)',
      ['edicion_guardada', 'si']);
  });
}

export async function hayEdicionGuardada(): Promise<boolean> {
  const [resultado] = await (await db).executeSql(`SELECT EXISTS (
    SELECT 1 FROM ajustes WHERE nombre = 'edicion_guardada' AND valor = 'si'
  ) OR EXISTS (SELECT 1 FROM charlas) AS existe`);
  // En instalaciones anteriores puede haber charlas, pero aún no el indicador nuevo.
  return Boolean(resultado.rows.item(0).existe);
}
export async function alternar(id: string) {
  await (await db).executeSql('UPDATE charlas SET favorita = 1 - favorita WHERE id = ?', [id]);
}
export async function ajuste(nombre: string, defecto: string): Promise<string> {
  const [rs] = await (await db).executeSql('SELECT valor FROM ajustes WHERE nombre = ?', [nombre]);
  return rs.rows.length ? rs.rows.item(0).valor : defecto;
}
export async function configurar(nombre: string, valor: string) {
  await (await db).executeSql('INSERT OR REPLACE INTO ajustes VALUES (?,?)', [nombre,valor]);
}
