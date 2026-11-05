namespace App.DTO.v1.Identity;

public class IdentityResponse
{
    public Guid Id { get; set; }

    public string Username { get; set; } = default!;

    /// <summary>First name from IPA, shown in the UI; may be null (then show Username).</summary>
    public string? DisplayName { get; set; }

    public List<string> Roles { get; set; } = new();
}
