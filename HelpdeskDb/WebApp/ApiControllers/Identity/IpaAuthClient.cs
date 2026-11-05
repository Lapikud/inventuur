using FreeIPA.DotNet;
using FreeIPA.DotNet.Models;
using FreeIPA.DotNet.Models.Login;
using FreeIPA.DotNet.Models.RPC;

namespace WebApp.ApiControllers.Identity;

/// <summary>
/// Thin wrapper around the freeipa-dotnet client so the server URL comes from
/// configuration ("Ipa:BaseUrl") instead of being hardcoded — the same FreeIPA
/// answers under different names depending on where the backend runs:
/// ipa.lapikud.ee publicly, ipa.kontor.lapikud.ee on the office network
/// (and ldaps on port 636 for plain-LDAP consumers like the wiki).
/// </summary>
public class IpaAuthClient : IIpaAuthClient
{
    private readonly IpaClient _client;

    public IpaAuthClient(IConfiguration configuration)
    {
        var baseUrl = configuration["Ipa:BaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = "https://ipa.lapikud.ee";
        }

        _client = new IpaClient(baseUrl);
    }

    public Task<IpaResultModel<IpaLoginResponseModel>> LoginWithPassword(IpaLoginRequestModel request)
        => _client.LoginWithPassword(request);

    public Task<IpaResultModel<IpaRpcResponseModel>> SendRpcRequest(IpaRpcRequestModel request)
        => _client.SendRpcRequest(request);
}
