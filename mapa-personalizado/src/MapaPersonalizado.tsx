import { useState } from 'react';
import { Usuario, TipoUsuario } from './types';
import { regioes } from './data';

export default function MapaPersonalizado() {
  const [usuario, setUsuario] = useState<Usuario>({
    tipo: 'ciclista',
    preferencias: {
      evitar_ruas_sem_ciclovia: true,
      mostrar_irregularidades: true
    }
  });

  const handleTipoChange = (tipo: TipoUsuario) => {
    setUsuario({ ...usuario, tipo });
  };

  const regioesFiltradas = regioes.filter(regiao =>
    regiao.tipo_permissao.includes(usuario.tipo)
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mapa Personalizado</h1>

      <label htmlFor="tipoUsuario">Tipo de Usuário:</label>
      <select
        id="tipoUsuario"
        value={usuario.tipo}
        onChange={e => handleTipoChange(e.target.value as TipoUsuario)}
        style={{ marginLeft: '10px', padding: '5px' }}
      >
        <option value="ciclista">Ciclista</option>
        <option value="pedestre">Pedestre</option>
        <option value="motorista">Motorista</option>
      </select>

      <div style={{ marginTop: '20px' }}>
        {regioesFiltradas.map(regiao => (
          <div
            key={regiao.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
              backgroundColor: regiao.rota_segura ? '#d4edda' : '#f8d7da'
            }}
          >
            <strong>{regiao.nome}</strong><br />
            {usuario.preferencias.mostrar_irregularidades &&
              regiao.irregularidades.length > 0 && (
                <span><em>Irregularidades:</em> {regiao.irregularidades.join(', ')}</span>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
