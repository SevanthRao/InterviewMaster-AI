function prependHistoryEntry(session, entry) {
    const historyEntry = {
        type: entry.type,
        label: entry.label,
        detail: entry.detail || "",
        createdAt: new Date()
    }

    const nextHistory = [historyEntry, ...(Array.isArray(session.history) ? session.history : [])]
    session.history = nextHistory.slice(0, 20)
}

module.exports = {
    prependHistoryEntry
}
