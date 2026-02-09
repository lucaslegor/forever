import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Info, UserCheck } from 'lucide-react';
import { Footer } from '../components/Footer';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { grupoFamiliarService } from '../services/grupoFamiliar.service';
import styles from './GrupoFamiliar.module.css';

interface MiembroGrupo {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

interface GrupoFamiliarData {
    miembros: MiembroGrupo[];
    titularDni: string;
}

export const GrupoFamiliar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [grupo, setGrupo] = useState<GrupoFamiliarData | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (user?.role !== 'deportista') {
                setLoading(false);
                return;
            }
            try {
                const res = await grupoFamiliarService.getMios();
                if (cancelled) return;
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const g = res.data[0] as any;
                    const integrantes = g.integrantes || [];
                    const miembros: MiembroGrupo[] = integrantes.map((i: any) => ({
                        id: i.deportista?.id ?? i.deportistaId,
                        nombre: i.deportista?.nombre ?? '',
                        apellido: i.deportista?.apellido ?? '',
                        dni: i.deportista?.dni ?? '',
                    }));
                    setGrupo({
                        miembros,
                        titularDni: g.titularDni ?? miembros[0]?.dni ?? '',
                    });
                }
            } catch {
                if (!cancelled) setGrupo(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [user?.loginId, user?.role]);

    if (loading) {
        return (
            <div className={styles.page}>
                <main className={styles.mainContent}>
                    <LoadingScreen fullPage />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <img src="/logo.png" alt="Club For Ever" className={styles.headerLogo} />
                    <span className={styles.headerClubName}>Club Social y Deportivo For Ever</span>
                </div>
                <h1 className={styles.title}>Grupo Familiar</h1>
                <div className={styles.headerRight} aria-hidden />
            </header>

            <main className={styles.mainContent}>
                <div className={styles.contentCard}>
                    <p className={styles.intro}>
                        <Users size={22} />
                        Su grupo familiar está conformado por:
                    </p>

                    {!grupo ? (
                        <p className={styles.noGroup}>No estás registrado en un grupo familiar. Para adherirte, contactate con el club.</p>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Nombre</th>
                                        <th className={styles.th}>Apellido</th>
                                        <th className={styles.th}>DNI</th>
                                        <th className={styles.th}>Rol</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grupo.miembros.map((m) => (
                                        <tr key={m.id} className={styles.tr}>
                                            <td className={styles.td}>{m.nombre}</td>
                                            <td className={styles.td}>{m.apellido}</td>
                                            <td className={styles.td}>{m.dni}</td>
                                            <td className={styles.td}>
                                                {m.dni === grupo.titularDni ? (
                                                    <span className={styles.titularBadge}>
                                                        <UserCheck size={18} />
                                                        Titular
                                                    </span>
                                                ) : (
                                                    <span className={styles.miembroBadge}>Miembro</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.notice}>
                        <Info size={22} />
                        <p>
                            Para adherir una persona al grupo familiar debe contactarse con algún dirigente del club.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                            Volver
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
