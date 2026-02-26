from .reads import (
    ens_check,
    ens_profile,
    ens_resolve,
    ens_list,
    ens_verify,
    ens_namehash,
    ens_labelhash,
    ens_resolver,
    ens_deployments,
)
from .writes import (
    ens_build_commit_tx,
    ens_build_register_tx,
    ens_build_set_records_tx,
    ens_build_renew_tx,
    ens_build_transfer_tx,
    ens_build_primary_tx,
    ens_build_subname_tx,
)

read_tools = [
    ens_check,
    ens_profile,
    ens_resolve,
    ens_list,
    ens_verify,
    ens_namehash,
    ens_labelhash,
    ens_resolver,
    ens_deployments,
]

write_tools = [
    ens_build_commit_tx,
    ens_build_register_tx,
    ens_build_set_records_tx,
    ens_build_renew_tx,
    ens_build_transfer_tx,
    ens_build_primary_tx,
    ens_build_subname_tx,
]

all_tools = read_tools + write_tools
