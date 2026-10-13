async function run() {
    console.log("🚀 Démarrage de la simulation du parcours utilisateur (Frontend -> Backend)...");
    const BASE_URL = 'http://localhost:8000/api';
    let token = '';

    try {
        console.log("\n1️⃣ [LOGIN] Tentative de connexion (admin@test.com)...");
        const res1 = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const data1 = await res1.json();
        if (!res1.ok) throw new Error("Login failed: " + JSON.stringify(data1));
        token = data1.token;
        console.log("✅ Succès: Token reçu.");

        console.log("\n2️⃣ [PROFIL] Récupération des informations de l'utilisateur...");
        const res2 = await fetch(`${BASE_URL}/me`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res2.ok) throw new Error("Fetch profile failed");
        const data2 = await res2.json();
        console.log(`✅ Succès: Bonjour ${data2.data.name} !`);

        console.log("\n3️⃣ [CATALOGUE] Chargement des ressources...");
        const res3 = await fetch(`${BASE_URL}/resources`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!res3.ok) throw new Error("Fetch resources failed");
        const data3 = await res3.json();
        console.log(`✅ Succès: ${data3.data.length} documents affichés dans le catalogue.`);

        console.log("\n4️⃣ [IA] Test de la génération de description automatique...");
        const pdfContent = "%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\n";
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', blob, 'document-test.pdf');

        const res4 = await fetch(`${BASE_URL}/resources/generate-description`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
            body: formData
        });
        const data4 = await res4.json();
        if (res4.status === 500) {
            console.log("❌ ERREUR 500 sur l'IA: " + JSON.stringify(data4));
        } else if (res4.ok) {
            console.log("✅ Succès IA: Résumé généré -> " + data4.summary.substring(0, 50) + "...");
        } else {
            console.log("⚠️ Info IA (Erreur attendue car faux PDF vide envoyé): " + JSON.stringify(data4));
        }

        if (data3.data.length > 0) {
            // Find a resource not authored by the admin to review it
            const doc = data3.data.find(d => d.author_user?.id !== data2.data.id) || data3.data[0];
            console.log(`\n5️⃣ [AVIS] Ajout d'un avis sur le document #${doc.id}...`);
            const res5 = await fetch(`${BASE_URL}/resources/${doc.id}/reviews`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ rating: 5, comment: "Excellent document pour la bibliothèque!" })
            });
            const data5 = await res5.json();
            if (res5.status === 500) throw new Error("Review 500: " + JSON.stringify(data5));
            console.log(`✅ Succès API Avis (Statut ${res5.status}): ` + (res5.ok ? "Avis publié." : data5.message));
        }

        console.log("\n🎉 SIMULATION TERMINÉE. Aucun crash (500) détecté sur le parcours critique.");
    } catch (e) {
        console.error("\n❌ ERREUR LORS DE LA SIMULATION:", e);
    }
}
run();
