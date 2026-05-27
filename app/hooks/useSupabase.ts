"use client";
import { useState, useEffect } from 'react'
import {
  getClients, getDevis, getPaiements, getPartenaires,
  getEquipe, getMissions, getStock, getContrats,
  getDeals, getNotifications, getAvis,
  subscribeNotifications, addNotification
} from '@/lib/supabase'

export function useSupabase() {
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [devis, setDevis] = useState<any[]>([])
  const [paiements, setPaiements] = useState<any[]>([])
  const [partenaires, setPartenaires] = useState<any[]>([])
  const [equipe, setEquipe] = useState<any[]>([])
  const [missions, setMissions] = useState<any[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [contrats, setContrats] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [avis, setAvis] = useState<any[]>([])

  // Chargement initial de toutes les données
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      try {
        const [
          clientsData, devisData, paiementsData, partenairesData,
          equipeData, missionsData, stockData, contratsData,
          dealsData, notifsData, avisData
        ] = await Promise.all([
          getClients(), getDevis(), getPaiements(), getPartenaires(),
          getEquipe(), getMissions(), getStock(), getContrats(),
          getDeals(), getNotifications(), getAvis()
        ])

        setClients(clientsData)
        setDevis(devisData)
        setPaiements(paiementsData)
        setPartenaires(partenairesData)
        setEquipe(equipeData)
        setMissions(missionsData)
        setStock(stockData)
        setContrats(contratsData)
        setDeals(dealsData)
        setNotifications(notifsData)
        setAvis(avisData)
      } catch (err) {
        console.error('Erreur chargement données:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  // Notifications temps réel
  useEffect(() => {
    const channel = subscribeNotifications((newNotif) => {
      setNotifications(prev => [newNotif, ...prev])
    })
    return () => { channel.unsubscribe() }
  }, [])

  // Fonctions de rafraîchissement
  const refreshClients = async () => setClients(await getClients())
  const refreshDevis = async () => setDevis(await getDevis())
  const refreshPaiements = async () => setPaiements(await getPaiements())
  const refreshStock = async () => setStock(await getStock())
  const refreshDeals = async () => setDeals(await getDeals())
  const refreshNotifications = async () => setNotifications(await getNotifications())

  // Statistiques calculées automatiquement
  const stats = {
    totalCA: paiements.filter(p => p.type === 'entree').reduce((a: number, p: any) => a + p.montant, 0),
    totalClients: clients.length,
    clientsVIP: clients.filter(c => c.vip).length,
    devisEnAttente: devis.filter(d => d.statut === 'envoyé' || d.statut === 'en_attente').length,
    devisSignes: devis.filter(d => d.statut === 'signé' || d.statut === 'payé').length,
    stockCritique: stock.filter(s => s.quantite < s.quantite_min).length,
    missionsEnCours: missions.filter(m => m.statut === 'en cours').length,
    notifsNonLues: notifications.filter(n => !n.lu).length,
    dealsActifs: deals.filter(d => !['Gagné', 'Perdu'].includes(d.etape)).length,
    pipelineTotal: deals.reduce((a: number, d: any) => a + d.valeur, 0),
  }

  return {
    loading,
    // Données
    clients, setClients,
    devis, setDevis,
    paiements, setPaiements,
    partenaires, setPartenaires,
    equipe, setEquipe,
    missions, setMissions,
    stock, setStock,
    contrats, setContrats,
    deals, setDeals,
    notifications, setNotifications,
    avis, setAvis,
    // Stats
    stats,
    // Refresh
    refreshClients,
    refreshDevis,
    refreshPaiements,
    refreshStock,
    refreshDeals,
    refreshNotifications,
  }
}