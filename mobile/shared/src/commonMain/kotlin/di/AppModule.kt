package di

import org.koin.dsl.module
import network.ApiClient

val appModule = module {
    single { ApiClient() }
}
