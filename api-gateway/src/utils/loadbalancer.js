const loadbalancer = {}
loadbalancer.ROUND_ROBIN = (services) => {
    console.log("Load Balance services: ",services)
    const newIndex = ++services.index >= services.instances.length ? 0 : services.index
    services.index = newIndex
    return loadbalancer.isEnabled(services, newIndex, loadbalancer.ROUND_ROBIN)
}

loadbalancer.isEnabled = (services, index, loadBalanceStrategy) =>{
    return services.instances[index].state ? index : loadBalanceStrategy(services)
}

export default loadbalancer;