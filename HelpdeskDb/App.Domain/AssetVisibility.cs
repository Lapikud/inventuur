using System.Text.Json.Serialization;

namespace App.Domain;

/// <summary>
/// Who can see a given asset. Mirrors the inventory-app visibility ladder:
/// Featured and Normal are publicly visible, Protected requires membership,
/// Archived drops out of all default listings.
/// Travels over the API as its name ("Normal"), not its number.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AssetVisibility
{
    Normal,
    Featured,
    Protected,
    Archived,
}
